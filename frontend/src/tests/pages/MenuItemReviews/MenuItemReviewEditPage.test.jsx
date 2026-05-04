import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import MenuItemReviewEditPage from "main/pages/MenuItemReviews/MenuItemReviewEditPage";

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
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("MenuItemReviewEditPage tests", () => {
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
      axiosMock.onGet("/api/menuitemreview", { params: { id: 17 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit MenuItemReview");
      expect(
        screen.queryByTestId("MenuItemReview-itemId"),
      ).not.toBeInTheDocument();
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
      axiosMock
        .onGet("/api/menuitemreview", { params: { id: 17 } })
        .reply(200, {
          id: 17,
          itemId: 1,
          reviewerEmail: "email@gmail.com",
          stars: 4,
          dateReviewed: "2022-01-02T12:00:00",
          comments: "yum",
        });
      axiosMock.onPut("/api/menuitemreview").reply(200, {
        id: 17,
        itemId: 3,
        reviewerEmail: "email1@gmail.com",
        stars: 5,
        dateReviewed: "2022-02-02T12:00:00",
        comments: "yummy",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided, and changes when data is changed", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReviewForm-id");

      const idField = screen.getByTestId("MenuItemReviewForm-id");

      const itemIdField = screen.getByLabelText("Item ID");

      const reviewerEmailField = screen.getByLabelText("Reviewer Email");

      const starsField = screen.getByLabelText("Stars");

      const dateReviewedField = screen.getByLabelText("Date Reviewed (in UTC)");

      const commentsField = screen.getByLabelText("Comments");

      const submitButton = screen.getByText("Update");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");

      expect(itemIdField).toBeInTheDocument();
      expect(itemIdField).toHaveValue(1);

      expect(reviewerEmailField).toBeInTheDocument();
      expect(reviewerEmailField).toHaveValue("email@gmail.com");

      expect(starsField).toBeInTheDocument();
      expect(starsField).toHaveValue(4);

      expect(dateReviewedField).toBeInTheDocument();
      expect(dateReviewedField).toHaveValue("2022-01-02T12:00");

      expect(commentsField).toBeInTheDocument();
      expect(commentsField).toHaveValue("yum");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(itemIdField, {
        target: { value: "3", valueAsNumber: 3 },
      });
      fireEvent.change(reviewerEmailField, {
        target: { value: "email1@gmail.com" },
      });
      fireEvent.change(starsField, {
        target: { value: "5", valueAsNumber: 5 },
      });
      fireEvent.change(dateReviewedField, {
        target: { value: "2022-02-02T12:00:00" },
      });
      fireEvent.change(commentsField, {
        target: { value: "yummy" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "MenuItemReview Updated - id: 17 itemId: 3",
      );

      expect(mockNavigate).toBeCalledWith({ to: "/menuitemreviews" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          itemId: "3",
          reviewerEmail: "email1@gmail.com",
          stars: "5",
          dateReviewed: "2022-02-02T12:00",
          comments: "yummy",
        }),
      ); // posted object
      expect(mockNavigate).toBeCalledWith({ to: "/menuitemreviews" });
    });
  });
});
