import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import ArticlesCreatePage from "main/pages/Articles/ArticlesCreatePage";
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

describe("ArticlesCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("renders without crashing", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
    });
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const queryClient = new QueryClient();
    const article = {
      id: 17,
      title: "article 1",
      url: "https://github.com/ucsb-cs156-s26/team02-s26-05/pull/64",
      explanation: "explanation 1",
      email: "someEmail1@ucsb.edu",
      localDateTime: "2022-01-02T12:00",
    };

    axiosMock.onPost("/api/articles/post").reply(202, article);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
    });

    const titleField = screen.getByTestId("ArticlesForm-title");
    const urlField = screen.getByTestId("ArticlesForm-url");
    const explanationField = screen.getByTestId("ArticlesForm-explanation");
    const emailField = screen.getByTestId("ArticlesForm-email");
    const localDateTimeField = screen.getByTestId("ArticlesForm-localDateTime");
    const submitButton = screen.getByTestId("ArticlesForm-submit");

    fireEvent.change(titleField, { target: { value: "article 1" } });
    fireEvent.change(urlField, {
      target: {
        value: "https://github.com/ucsb-cs156-s26/team02-s26-05/pull/64",
      },
    });
    fireEvent.change(explanationField, {
      target: { value: "explanation 1" },
    });
    fireEvent.change(emailField, {
      target: { value: "someEmail1@ucsb.edu" },
    });
    fireEvent.change(localDateTimeField, {
      target: { value: "2022-01-02T12:00" },
    });

    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      title: "article 1",
      url: "https://github.com/ucsb-cs156-s26/team02-s26-05/pull/64",
      explanation: "explanation 1",
      email: "someEmail1@ucsb.edu",
      localDateTime: "2022-01-02T12:00",
    });

    expect(mockToast).toBeCalledWith(
      "New article Created - id: 17 title: article 1",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/articles" });
  });
});