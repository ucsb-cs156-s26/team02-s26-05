import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { Navigate, useParams } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function HelpRequestEditPage({ storybook = false }) {
  let { id } = useParams();

  const {
    data: helpRequest,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/helprequests?id=${id}`],
    {
      // Stryker disable next-line all : GET is the default, so mutating this to "" doesn't introduce a bug
      method: "GET",
      url: "/api/helprequests",
      params: {
        id,
      },
    },
  );

  const objectToAxiosPutParams = (hr) => ({
    url: "/api/helprequests",
    method: "PUT",
    params: {
      id: hr.id,
    },
    data: {
      requesterEmail: hr.requesterEmail,
      teamId: hr.teamId,
      tableOrBreakoutRoom: hr.tableOrBreakoutRoom,
      requestTime: hr.requestTime,
      explanation: hr.explanation,
      solved: Boolean(hr.solved),
    },
  });

  const onSuccess = (hr) => {
    toast(`Help Request Updated - id: ${hr.id} email: ${hr.requesterEmail}`);
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/helprequests?id=${id}`],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/helprequest" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit HelpRequest</h1>
        {helpRequest && (
          <HelpRequestForm
            initialContents={helpRequest}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
