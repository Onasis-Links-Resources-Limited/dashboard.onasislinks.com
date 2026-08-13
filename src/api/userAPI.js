// Mock Users API service.
//
// Mirrors the shape a real backend would return, so swapping to real calls
// later is a matter of replacing the function bodies with `api.get/post/
// put/delete` calls (see src/api/client.js) without touching Users.jsx.
//
//   GET    /api/users
//   GET    /api/users/:id
//   POST   /api/users
//   PUT    /api/users/:id
//   PUT    /api/users/:id/status
//   DELETE /api/users/:id

export const ROLE_OPTIONS = ["admin", "manager", "sales", "tech", "viewer"];
export const STATUS_OPTIONS = ["active", "inactive", "suspended"];

const FIRST_NAMES = [
  "Adaeze",
  "Chinedu",
  "Bimpe",
  "Femi",
  "Kelechi",
  "Amara",
  "Tayo",
  "Ijeoma",
  "Segun",
  "Ronke",
  "Uche",
  "Yemi",
];
const LAST_NAMES = [
  "Okafor",
  "Balogun",
  "Eze",
  "Adewale",
  "Nwachukwu",
  "Ibrahim",
  "Okoro",
  "Ogundele",
  "Abiodun",
  "Danjuma",
];
const DEPARTMENTS = [
  "Management",
  "Sales",
  "Technical Support",
  "Procurement",
  "Logistics",
  "Finance",
];

const seededRandom = (seed) => {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
};

const buildUser = (index) => {
  const rand = seededRandom(index * 5237 + 41);
  const first = FIRST_NAMES[index % FIRST_NAMES.length];
  const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
  const name = index === 0 ? "Admin User" : `${first} ${last}`;
  const role =
    index === 0
      ? "admin"
      : ROLE_OPTIONS[Math.floor(rand() * ROLE_OPTIONS.length)];
  const status =
    rand() > 0.85 ? (rand() > 0.5 ? "inactive" : "suspended") : "active";

  const daysAgo = Math.floor(rand() * 400);
  const joined = new Date();
  joined.setDate(joined.getDate() - daysAgo);

  const email =
    index === 0
      ? "admin@onasisltd.com"
      : `${first}.${last}`.toLowerCase() + "@onasisltd.com";

  return {
    id: `U-${String(index + 1).padStart(3, "0")}`,
    name,
    email,
    role,
    status,
    avatar: `https://ui-avatars.com/api/?background=C3110C&color=fff&name=${encodeURIComponent(name)}`,
    joinedDate: joined.toISOString().slice(0, 10),
    phone: `+234 8${String(Math.floor(rand() * 100000000)).padStart(9, "0")}`,
    department: DEPARTMENTS[Math.floor(rand() * DEPARTMENTS.length)],
  };
};

const TOTAL_MOCK_USERS = 23;
const MOCK_USERS = Array.from({ length: TOTAL_MOCK_USERS }, (_, i) =>
  buildUser(i),
);
let nextIdNum = TOTAL_MOCK_USERS + 1;

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

const matchesSearch = (user, search) => {
  if (!search) return true;
  const term = search.trim().toLowerCase();
  return (
    user.name.toLowerCase().includes(term) ||
    user.email.toLowerCase().includes(term) ||
    user.id.toLowerCase().includes(term)
  );
};

const sortUsers = (users, sortBy, sortOrder) => {
  const dir = sortOrder === "asc" ? 1 : -1;
  return [...users].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name) * dir;
      case "role":
        return a.role.localeCompare(b.role) * dir;
      case "joinedDate":
      default:
        return (
          (new Date(a.joinedDate).getTime() -
            new Date(b.joinedDate).getTime()) *
          dir
        );
    }
  });
};

const findUserOrThrow = (id) => {
  const user = MOCK_USERS.find((u) => u.id === id);
  if (!user) {
    const error = new Error(`User ${id} not found`);
    error.status = 404;
    throw error;
  }
  return user;
};

export const userAPI = {
  /** @returns {Promise<{data: object[], meta: {total:number, page:number, limit:number, totalPages:number}}>} */
  async getAll(params = {}) {
    await delay();
    const {
      page = 1,
      limit = 10,
      search = "",
      role = "all",
      status = "all",
      sortBy = "joinedDate",
      sortOrder = "desc",
    } = params;

    let results = MOCK_USERS.filter((u) => matchesSearch(u, search));
    if (role && role !== "all")
      results = results.filter((u) => u.role === role);
    if (status && status !== "all")
      results = results.filter((u) => u.status === status);
    results = sortUsers(results, sortBy, sortOrder);

    const total = results.length;
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const startIndex = (safePage - 1) * limit;

    return {
      data: results.slice(startIndex, startIndex + limit),
      meta: { total, page: safePage, limit, totalPages },
    };
  },

  async getById(id) {
    await delay(300);
    return findUserOrThrow(id);
  },

  async create(userData) {
    await delay(500);
    const id = `U-${String(nextIdNum++).padStart(3, "0")}`;
    const user = {
      id,
      name: userData.name,
      email: userData.email,
      role: userData.role || "viewer",
      status: userData.status || "active",
      avatar: `https://ui-avatars.com/api/?background=C3110C&color=fff&name=${encodeURIComponent(userData.name)}`,
      joinedDate: new Date().toISOString().slice(0, 10),
      phone: userData.phone || "",
      department: userData.department || "",
    };
    MOCK_USERS.unshift(user);
    return { success: true, data: user };
  },

  async update(id, userData) {
    await delay(500);
    const user = findUserOrThrow(id);
    Object.assign(user, {
      name: userData.name ?? user.name,
      email: userData.email ?? user.email,
      role: userData.role ?? user.role,
      status: userData.status ?? user.status,
      phone: userData.phone ?? user.phone,
      department: userData.department ?? user.department,
    });
    return { success: true, data: user };
  },

  async toggleStatus(id, status) {
    await delay(400);
    const user = findUserOrThrow(id);
    user.status = status;
    return { success: true, data: user };
  },

  async delete(id) {
    await delay(400);
    const index = MOCK_USERS.findIndex((u) => u.id === id);
    if (index === -1) {
      const error = new Error(`User ${id} not found`);
      error.status = 404;
      throw error;
    }
    MOCK_USERS.splice(index, 1);
    return { success: true };
  },

  async bulkDelete(ids) {
    await delay(500);
    ids.forEach((id) => {
      const index = MOCK_USERS.findIndex((u) => u.id === id);
      if (index !== -1) MOCK_USERS.splice(index, 1);
    });
    return { success: true, deleted: ids.length };
  },

  async exportCSV(params = {}) {
    await delay(400);
    const { search = "", role = "all", status = "all" } = params;
    let results = MOCK_USERS.filter((u) => matchesSearch(u, search));
    if (role && role !== "all")
      results = results.filter((u) => u.role === role);
    if (status && status !== "all")
      results = results.filter((u) => u.status === status);

    const header = [
      "User ID",
      "Name",
      "Email",
      "Role",
      "Status",
      "Department",
      "Joined",
    ];
    const rows = results.map((u) => [
      u.id,
      u.name,
      u.email,
      u.role,
      u.status,
      u.department,
      u.joinedDate,
    ]);
    const escapeCell = (cell) => {
      const value = String(cell);
      return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    };
    return [header, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\n");
  },
};

export default userAPI;
