// import React from "react";
// import { useBackend } from "main/utils/useBackend";

// import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
// import RecommendationRequestTable from "main/components/RecommendationRequests/RecommendationRequestTable";
// import { useCurrentUser, hasRole } from "main/utils/useCurrentUser";
// import { Button } from "react-bootstrap";

// export default function RecommendationRequestIndexPage() {
//   const currentUser = useCurrentUser();

//   const {
//     data: recommendationRequest,
//     error: _error,
//     status: _status,
//   } = useBackend(
//     // Stryker disable next-line all : don't test internal caching of React Query
//     ["/api/recommendationRequest/all"],
//     { method: "GET", url: "/api/recommendationRequest/all" },
//     // Stryker disable next-line all : don't test default value of empty list
//     [],
//   );

//   const createButton = () => {
//     if (hasRole(currentUser, "ROLE_ADMIN")) {
//       return (
//         <Button
//           variant="primary"
//           href="/recommendationRequest/create"
//           style={{ float: "right" }}
//         >
//           Create Recommendation Request
//         </Button>
//       );
//     }
//   };

//   return (
//     <BasicLayout>
//       <div className="pt-2">
//         {createButton()}
//         <h1>Recommendation Request</h1>
//         <RecommendationRequestTable
//           recommendationRequests={recommendationRequest}
//           currentUser={currentUser}
//         />
//       </div>
//     </BasicLayout>
//   );
// }

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";

export default function PlaceholderIndexPage() {
  // Stryker disable all : placeholder for future implementation
  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Index page not yet implemented</h1>
        <p>
          <a href="/placeholder/create">Create</a>
        </p>
        <p>
          <a href="/placeholder/edit/1">Edit</a>
        </p>
      </div>
    </BasicLayout>
  );
}
