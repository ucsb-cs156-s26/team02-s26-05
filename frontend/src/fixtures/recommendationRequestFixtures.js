const recommendationRequestFixtures = {
  oneRecommendationRequest: {
    id: 1,
    requesterEmail: "soome@ucsb.edu",
    professorEmail: "katie@ucsb.edu",
    explanation: "letter of rec for BSMS program",
    dateRequested: "2022-01-02T12:00:00",
    dateNeeded: "2022-03-02T12:00:00",
    done: true,
  },
  threeRecommendationRequests: [
    {
      id: 1,
      requesterEmail: "soome@ucsb.edu",
      professorEmail: "katie@ucsb.edu",
      explanation: "letter of rec for BSMS program",
      dateRequested: "2022-01-02T12:00:00",
      dateNeeded: "2022-03-02T12:00:00",
      done: false,
    },
    {
      id: 3,
      requesterEmail: "yuan@ucsb.edu",
      professorEmail: "ber@ucsb.edu",
      explanation: "letter of rec for PHD program for UCSB",
      dateRequested: "2022-12-03T12:00:00",
      dateNeeded: "2023-02-03T12:00:00",
      done: false,
    },
    {
      id: 4,
      requesterEmail: "pier@ucsb.edu",
      professorEmail: "harold@ucsb.edu",
      explanation: "letter of rec for summer research program",
      dateRequested: "2022-01-12T12:00:00",
      dateNeeded: "2023-04-22T12:00:00",
      done: true,
    },
  ],
};

export { recommendationRequestFixtures };
