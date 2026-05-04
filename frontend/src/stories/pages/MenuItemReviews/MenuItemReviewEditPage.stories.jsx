import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import MenuItemReviewEditPage from "main/pages/MenuItemReviews/MenuItemReviewEditPage";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";

export default {
  title: "pages/MenuItemReviews/MenuItemReviewEditPage",
  component: MenuItemReviewEditPage,
};

const Template = () => <MenuItemReviewEditPage storybook={true} />;

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
    http.get("/api/menuitemreview", () => {
      return HttpResponse.json(menuItemReviewFixtures.threeReviews[0], {
        status: 200,
      });
    }),

    http.put("/api/menuitemreview", () => {
      return HttpResponse.json(
        {
          id: 17,
          itemId: 3,
          reviewerEmail: "email1@gmail.com",
          stars: 5,
          dateReviewed: "2022-02-02T12:00:00",
          comments: "yummy",
        },
        { status: 200 },
      );
    }),
  ],
};
