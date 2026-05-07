import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import HelpRequestEditPage from "main/pages/HelpRequest/HelpRequestEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: "17",
    })),
    useNavigate: () => mockNavigate,
  };
});

let axiosMock;
describe("HelpRequestEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/helprequests", { params: { id: "17" } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("renders heading but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByText("Edit HelpRequest");
      expect(
        screen.queryByTestId("HelpRequestForm-requesterEmail"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    const existingHelpRequest = {
      id: 17,
      requesterEmail: "cgaucho@ucsb.edu",
      teamId: "s26-5pm-3",
      tableOrBreakoutRoom: "7",
      requestTime: "2025-10-08T17:30:00",
      explanation: "Need help with Swagger",
      solved: false,
    };

    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/helprequests", { params: { id: "17" } })
        .reply(200, existingHelpRequest);
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      axiosMock.onPut("/api/helprequests").reply(200, {
        id: 17,
        requesterEmail: "cgaucho@ucsb.edu",
        teamId: "s26-5pm-3",
        tableOrBreakoutRoom: "7",
        requestTime: "2025-10-08T17:30:00",
        explanation: "Updated explanation text",
        solved: false,
      });

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("HelpRequestForm-requesterEmail");

      expect(screen.getByTestId("HelpRequestForm-id")).toHaveValue("17");
      expect(screen.getByTestId("HelpRequestForm-requesterEmail")).toHaveValue(
        "cgaucho@ucsb.edu",
      );
      expect(screen.getByTestId("HelpRequestForm-teamId")).toHaveValue(
        "s26-5pm-3",
      );
      expect(screen.getByTestId("HelpRequestForm-submit")).toHaveTextContent(
        "Update",
      );

      fireEvent.change(screen.getByTestId("HelpRequestForm-explanation"), {
        target: { value: "Updated explanation text" },
      });

      fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Help Request Updated - id: 17 email: cgaucho@ucsb.edu",
      );
      expect(mockNavigate).toHaveBeenCalledWith("/helprequest", {
        replace: true,
      });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
        requesterEmail: "cgaucho@ucsb.edu",
        teamId: "s26-5pm-3",
        tableOrBreakoutRoom: "7",
        requestTime: "2025-10-08T17:30:00",
        explanation: "Updated explanation text",
        solved: false,
      });
    });

    test("does not call PUT when form has validation errors", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("HelpRequestForm-requesterEmail");

      fireEvent.change(screen.getByTestId("HelpRequestForm-requesterEmail"), {
        target: { value: "" },
      });
      fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

      await screen.findByText("Requester Email is required.");

      expect(axiosMock.history.put.length).toBe(0);
    });

    test("calls navigate(-1) when Cancel is clicked", async () => {
      axiosMock.onPut("/api/helprequests").reply(200, existingHelpRequest);

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("HelpRequestForm-cancel");

      fireEvent.click(screen.getByTestId("HelpRequestForm-cancel"));

      expect(mockNavigate).toHaveBeenCalledWith(-1);
      expect(axiosMock.history.put.length).toBe(0);
    });

    test("when storybook=true, successful update does not navigate", async () => {
      axiosMock.onPut("/api/helprequests").reply(200, {
        ...existingHelpRequest,
        explanation: "Storybook update",
      });

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <HelpRequestEditPage storybook={true} />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("HelpRequestForm-requesterEmail");

      fireEvent.change(screen.getByTestId("HelpRequestForm-explanation"), {
        target: { value: "Storybook update" },
      });

      fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

      await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith(
          "Help Request Updated - id: 17 email: cgaucho@ucsb.edu",
        ),
      );

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
