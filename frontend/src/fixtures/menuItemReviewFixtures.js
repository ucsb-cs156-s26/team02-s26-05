const menuItemReviewFixtures = {
  oneReview: {
    id: 1,
    itemId: 1,
    reviewerEmail: "email@gmail.com",
    stars: 4,
    dateReviewed: "2022-01-02T12:00:00",
    comments: "yum",
  },
  threeReviews: [
    {
      id: 1,
      itemId: 1,
      reviewerEmail: "email@gmail.com",
      stars: 4,
      dateReviewed: "2022-01-02T12:00:00",
      comments: "yum",
    },
    {
      id: 2,
      itemId: 2,
      reviewerEmail: "test@gmail.com",
      stars: 3,
      dateReviewed: "2022-01-02T12:00:01",
      comments: "tasty",
    },
    {
      id: 3,
      itemId: 3,
      reviewerEmail: "temail@gmail.com",
      stars: 2,
      dateReviewed: "2022-01-02T12:00:02",
      comments: "delicious",
    },
  ],
};

export { menuItemReviewFixtures };
