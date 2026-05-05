import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import mockConsole from "tests/testutils/mockConsole";
import { beforeEach, afterEach } from "vitest";

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
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;

describe("ArticlesEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    test("renders header but form is not present", async () => {
      const queryClient = new QueryClient();
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByText(/Welcome/);
      await screen.findByText("Edit Article");

      expect(screen.queryByTestId("ArticlesForm-title")).not.toBeInTheDocument();

      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
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

      axiosMock.onGet("/api/articles", { params: { id: 17 } }).reply(200, {
        id: 17,
        title: "article 1",
        url: "https://example.com",
        explanation: "explanation 1",
        email: "test@ucsb.edu",
        localDateTime: "2022-03-14T15:00",
      });

      axiosMock.onPut("/api/articles").reply(200, {
        id: 17,
        title: "updated article",
        url: "https://updated.com",
        explanation: "updated explanation",
        email: "updated@ucsb.edu",
        localDateTime: "2022-12-25T08:00",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    test("renders without crashing", async () => {
      const queryClient = new QueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByText(/Welcome/);
      await screen.findByTestId("ArticlesForm-title");

      expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();

      expect(queryClient.getQueryData(["/api/articles?id=17"])).toEqual({
        id: 17,
        title: "article 1",
        url: "https://example.com",
        explanation: "explanation 1",
        email: "test@ucsb.edu",
        localDateTime: "2022-03-14T15:00",
      });
    });

    test("Is populated with the data provided", async () => {
      const queryClient = new QueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-title");

      const idField = screen.getByTestId("ArticlesForm-id");
      const titleField = screen.getByTestId("ArticlesForm-title");
      const urlField = screen.getByTestId("ArticlesForm-url");
      const explanationField = screen.getByTestId("ArticlesForm-explanation");
      const emailField = screen.getByTestId("ArticlesForm-email");
      const localDateTimeField = screen.getByTestId("ArticlesForm-localDateTime");
      const submitButton = screen.getByTestId("ArticlesForm-submit");

      expect(idField).toHaveValue("17");
      expect(titleField).toHaveValue("article 1");
      expect(urlField).toHaveValue("https://example.com");
      expect(explanationField).toHaveValue("explanation 1");
      expect(emailField).toHaveValue("test@ucsb.edu");
      expect(localDateTimeField).toHaveValue("2022-03-14T15:00");
      expect(submitButton).toBeInTheDocument();
    });

    test("Changes when you click Update", async () => {
      const queryClient = new QueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-title");

      const idField = screen.getByTestId("ArticlesForm-id");
      const titleField = screen.getByTestId("ArticlesForm-title");
      const urlField = screen.getByTestId("ArticlesForm-url");
      const explanationField = screen.getByTestId("ArticlesForm-explanation");
      const emailField = screen.getByTestId("ArticlesForm-email");
      const localDateTimeField = screen.getByTestId("ArticlesForm-localDateTime");
      const submitButton = screen.getByTestId("ArticlesForm-submit");

      expect(idField).toHaveValue("17");

      fireEvent.change(titleField, {
        target: { value: "updated article" },
      });
      fireEvent.change(urlField, {
        target: { value: "https://updated.com" },
      });
      fireEvent.change(explanationField, {
        target: { value: "updated explanation" },
      });
      fireEvent.change(emailField, {
        target: { value: "updated@ucsb.edu" },
      });
      fireEvent.change(localDateTimeField, {
        target: { value: "2022-12-25T08:00" },
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());

      expect(mockToast).toBeCalledWith(
        "Article Updated - id: 17 title: updated article",
      );

      expect(mockNavigate).toBeCalledWith({ to: "/articles" });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });

      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          title: "updated article",
          url: "https://updated.com",
          explanation: "updated explanation",
          email: "updated@ucsb.edu",
          localDateTime: "2022-12-25T08:00",
        }),
      );

      expect(queryClient.getQueryState(["/api/articles?id=17"])).toBeDefined();
    });
  });
});