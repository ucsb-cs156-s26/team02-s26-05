import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

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
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("HelpRequestCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const queryClient = new QueryClient();

  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });
  });

  test("on submit with valid data, POST then toast and redirect to /helprequest", async () => {
    const saved = {
      id: 5,
      requesterEmail: "cgaucho@ucsb.edu",
      teamId: "s26-5pm-3",
      tableOrBreakoutRoom: "7",
      requestTime: "2025-10-08T17:30:00",
      explanation: "Need help",
      solved: false,
    };

    axiosMock.onPost("/api/helprequests/post").reply(202, saved);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Requester Email"), {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(screen.getByLabelText("Team Id"), {
      target: { value: "s26-5pm-3" },
    });
    fireEvent.change(screen.getByLabelText("Table or Breakout Room"), {
      target: { value: "7" },
    });
    fireEvent.change(screen.getByLabelText("Request Time (iso format)"), {
      target: { value: "2025-10-08T17:30" },
    });
    fireEvent.change(screen.getByLabelText("Explanation"), {
      target: { value: "Need help" },
    });

    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toMatchObject({
      requesterEmail: "cgaucho@ucsb.edu",
      teamId: "s26-5pm-3",
      tableOrBreakoutRoom: "7",
      explanation: "Need help",
      solved: false,
    });
    expect(
      axiosMock.history.post[0].params.requestTime.startsWith(
        "2025-10-08T17:30",
      ),
    ).toBe(true);

    expect(mockToast).toHaveBeenCalledWith(
      "New Help Request Created - id: 5 email: cgaucho@ucsb.edu",
    );
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/helprequest" });
  });

  test("on submit with invalid data, does not POST", async () => {
    axiosMock.onPost("/api/helprequests/post").reply(202, { id: 1 });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(
        screen.getByText(/Requester Email is required\./),
      ).toBeInTheDocument();
    });

    expect(axiosMock.history.post.length).toBe(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
