import React from "react";
import { MemoryRouter, Route, Routes } from "react-router";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import HelpRequestEditPage from "main/pages/HelpRequest/HelpRequestEditPage";

export default {
  title: "pages/HelpRequest/HelpRequestEditPage",
  component: HelpRequestEditPage,
};

const editable = { ...helpRequestFixtures.oneHelpRequest, id: 17 };

const Template = () => (
  <MemoryRouter initialEntries={["/helprequest/edit/17"]}>
    <Routes>
      <Route
        path="/helprequest/edit/:id"
        element={<HelpRequestEditPage storybook={true} />}
      />
    </Routes>
  </MemoryRouter>
);

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.get("/api/helprequests", () => {
      return HttpResponse.json(editable, {
        status: 200,
      });
    }),
    http.put("/api/helprequests", () => {
      return HttpResponse.json(editable, { status: 200 });
    }),
  ],
};
