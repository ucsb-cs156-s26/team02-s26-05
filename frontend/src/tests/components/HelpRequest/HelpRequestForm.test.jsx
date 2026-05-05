import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("HelpRequestForm tests", () => {
  const expectedHeaders = [
    "Requester Email",
    "Team Id",
    "Table or Breakout Room",
    "Request Time (iso format)",
    "Explanation",
    "Solved",
  ];
  const testId = "HelpRequestForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <Router>
        <HelpRequestForm initialContents={helpRequestFixtures.oneHelpRequest} />
      </Router>,
    );

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText("Id")).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-id`)).toHaveValue("1");
  });

  test("strips trailing Z from requestTime when passed in initialContents", async () => {
    render(
      <Router>
        <HelpRequestForm
          initialContents={{
            ...helpRequestFixtures.oneHelpRequest,
            requestTime: "2025-10-08T17:30:00Z",
          }}
        />
      </Router>,
    );
    const requestTimeField = await screen.findByTestId(`${testId}-requestTime`);
    expect(requestTimeField.value.startsWith("2025-10-08T17:30")).toBe(true);
    expect(requestTimeField.value.endsWith("Z")).toBe(false);
  });

  test("falls back to empty requestTime when initialContents has none", async () => {
    render(
      <Router>
        <HelpRequestForm initialContents={{ id: 7 }} />
      </Router>,
    );
    const requestTimeField = await screen.findByTestId(`${testId}-requestTime`);
    expect(requestTimeField).toHaveValue("");
    expect(screen.getByTestId(`${testId}-id`)).toHaveValue("7");
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId(`${testId}-cancel`));

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("required field error messages on empty submit", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );

    fireEvent.click(await screen.findByTestId(`${testId}-submit`));

    await screen.findByText(/Requester Email is required\./);
    expect(screen.getByText(/Team Id is required\./)).toBeInTheDocument();
    expect(
      screen.getByText(/Table or Breakout Room is required\./),
    ).toBeInTheDocument();
    expect(screen.getByText(/Request Time is required\./)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required\./)).toBeInTheDocument();
  });

  test("bad-input validation messages", async () => {
    render(
      <Router>
        <HelpRequestForm />
      </Router>,
    );

    const submitButton = await screen.findByTestId(`${testId}-submit`);

    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-teamId`), {
      target: { value: "a".repeat(31) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-tableOrBreakoutRoom`), {
      target: { value: "b".repeat(51) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "c".repeat(256) },
    });

    fireEvent.click(submitButton);

    await screen.findByText(/Requester Email must be a valid email address\./);
    expect(screen.getByText(/Max length 30 characters/)).toBeInTheDocument();
    expect(screen.getByText(/Max length 50 characters/)).toBeInTheDocument();
    expect(screen.getByText(/Max length 255 characters/)).toBeInTheDocument();
  });

  test("submitAction is called with valid input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <HelpRequestForm submitAction={mockSubmitAction} />
      </Router>,
    );

    fireEvent.change(await screen.findByTestId(`${testId}-requesterEmail`), {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-teamId`), {
      target: { value: "s26-5pm-3" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-tableOrBreakoutRoom`), {
      target: { value: "7" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-requestTime`), {
      target: { value: "2025-10-08T17:30" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "Need help with Swagger" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-solved`));

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());
  });
});
