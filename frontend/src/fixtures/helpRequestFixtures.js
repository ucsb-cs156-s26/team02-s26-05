const helpRequestFixtures = {
  oneHelpRequest: {
    id: 1,
    requesterEmail: "cgaucho@ucsb.edu",
    teamId: "s26-5pm-3",
    tableOrBreakoutRoom: "7",
    requestTime: "2025-10-08T17:30:00",
    explanation: "Need help with Swagger",
    solved: false,
  },
  threeHelpRequests: [
    {
      id: 1,
      requesterEmail: "cgaucho@ucsb.edu",
      teamId: "s26-5pm-3",
      tableOrBreakoutRoom: "7",
      requestTime: "2025-10-08T17:30:00",
      explanation: "Need help with Swagger",
      solved: false,
    },
    {
      id: 2,
      requesterEmail: "ldelplaya@ucsb.edu",
      teamId: "s26-6pm-4",
      tableOrBreakoutRoom: "11",
      requestTime: "2025-10-09T18:15:00",
      explanation: "Heroku deployment issue",
      solved: true,
    },
    {
      id: 3,
      requesterEmail: "pdewinter@ucsb.edu",
      teamId: "s26-5pm-2",
      tableOrBreakoutRoom: "Breakout Room 4",
      requestTime: "2025-10-10T19:00:00",
      explanation: "Merge conflict in App.js",
      solved: false,
    },
  ],
};

export { helpRequestFixtures };
