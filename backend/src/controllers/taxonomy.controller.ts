import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/async-handler.js";

export const listCities = asyncHandler(async (_request, response) => {
  const cities = await prisma.city.findMany({
    where: {
      schools: {
        some: {
          status: "approved"
        }
      }
    },
    include: {
      state: true,
      _count: {
        select: {
          schools: {
            where: {
              status: "approved"
            }
          }
        }
      }
    },
    orderBy: {
      name: "asc"
    }
  });

  response.json({ data: cities });
});

export const listStates = asyncHandler(async (_request, response) => {
  const states = await prisma.state.findMany({
    where: {
      cities: {
        some: {
          schools: {
            some: {
              status: "approved"
            }
          }
        }
      }
    },
    include: {
      cities: {
        where: {
          schools: {
            some: {
              status: "approved"
            }
          }
        },
        include: {
          _count: {
            select: {
              schools: {
                where: {
                  status: "approved"
                }
              }
            }
          }
        },
        orderBy: {
          name: "asc"
        }
      }
    },
    orderBy: {
      name: "asc"
    }
  });

  response.json({ data: states });
});

export const listBoards = asyncHandler(async (_request, response) => {
  const boards = await prisma.board.findMany({
    include: {
      _count: {
        select: {
          schools: {
            where: {
              status: "approved"
            }
          }
        }
      }
    },
    orderBy: {
      name: "asc"
    }
  });

  response.json({ data: boards });
});
