import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { getPasswordErrors } from "../../utils/validators";
import { adminLocalService } from "../services/adminLocalService";

const colleges = {
  Sheridan: ["Davis Campus", "Trafalgar Road Campus", "Hazel McCallion Campus"],
  Humber: ["North Campus", "Lakeshore Campus", "International Graduate School"],
  Seneca: ["Newnham Campus", "King Campus", "Seneca@York Campus", "Markham Campus"],
  Conestoga: ["Doon Campus", "Waterloo Campus", "Cambridge Campus", "Guelph Campus"],
};

const emptyUserForm = {
  fullName: "",
  email: "",
  password: "",
  college: "Sheridan",
  campus: "Davis Campus",
  program: "Computer Systems Technology",
  role: "student",
};

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState(emptyUserForm);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sortConfig, setSortConfig] = useState({
  key: "fullName",
  direction: "asc",
});

function handleSort(key) {
  setSortConfig((current) => ({
    key,
    direction:
      current.key === key && current.direction === "asc" ? "desc" : "asc",
  }));
}

const sortedUsers = useMemo(() => {
  return [...users].sort((a, b) => {
    const aValue = a[sortConfig.key] ?? "";
    const bValue = b[sortConfig.key] ?? "";

    return sortConfig.direction === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });
}, [users, sortConfig]);

function sortIcon(key) {
  if (sortConfig.key !== key) return "unfold_more";
  return sortConfig.direction === "asc" ? "arrow_upward" : "arrow_downward";
}
  function loadUsers() {
    adminLocalService.getUsers().then(setUsers);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function addUser(event) {
    event.preventDefault();
    setFormError("");

    const passwordErrors = getPasswordErrors(newUser.password);

    if (passwordErrors.length > 0) {
      setFormError(passwordErrors[0]);
      return;
    }

    await adminLocalService.addUser(newUser);

    setNewUser(emptyUserForm);
    setShowAddForm(false);
    setShowPassword(false);
    loadUsers();
  }

  function startEdit(user) {
    setEditingUserId(user.id);
    setEditForm({
      ...user,
      college: user.college || "Sheridan",
      campus: user.campus || "Davis Campus",
      program: user.program || "Computer Systems Technology",
      role: user.role || "student",
      status: user.status || "Active",
    });
  }

  function cancelEdit() {
    setEditingUserId(null);
    setEditForm({});
  }

  async function saveUser(id) {
    await adminLocalService.updateUser(id, editForm);
    cancelEdit();
    loadUsers();
  }

  async function toggleBlock(user) {
    const nextStatus = user.status === "Blocked" ? "Active" : "Blocked";

    await adminLocalService.updateUser(user.id, {
      status: nextStatus,
    });

    loadUsers();
  }

  async function deleteUser(id) {
    const ok = window.confirm(
      "Delete this user? Their marketplace listings will also be removed."
    );

    if (!ok) return;

    await adminLocalService.deleteUser(id);
    loadUsers();
  }

  return (
    <>
      <div className="admin-page-heading admin-page-heading-row">
        <div>
          <span className="eyebrow">Admin</span>
          <h2>Users</h2>
          <p>Add, edit, block, unblock, and remove users.</p>
        </div>

        <button
          type="button"
          className="admin-add-button"
          onClick={() => {
            setShowAddForm((current) => !current);
            setFormError("");
          }}
        >
          <span className="material-symbols-rounded">person_add</span>
          Add User
        </button>
      </div>

      {showAddForm && (
        <Card className="admin-form-card">
          {formError && <div className="form-error">{formError}</div>}

          <form onSubmit={addUser} className="admin-inline-form">
            <label>
              Full Name
              <input
                value={newUser.fullName}
                onChange={(event) =>
                  setNewUser({ ...newUser, fullName: event.target.value })
                }
                placeholder="Example: Jasvir Singh"
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={newUser.email}
                onChange={(event) =>
                  setNewUser({ ...newUser, email: event.target.value })
                }
                placeholder="jasvir@college.ca"
                required
              />
            </label>

            <label>
              Password
              <div className="password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newUser.password}
                  onChange={(event) =>
                    setNewUser({ ...newUser, password: event.target.value })
                  }
                  placeholder="Example: Jasvir123!"
                  required
                />

                <button
                  type="button"
                  className="password-toggle-button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-rounded">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </label>

            <label>
              College
              <select
                value={newUser.college}
                onChange={(event) =>
                  setNewUser({
                    ...newUser,
                    college: event.target.value,
                    campus: colleges[event.target.value][0],
                  })
                }
              >
                {Object.keys(colleges).map((college) => (
                  <option key={college} value={college}>
                    {college}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Campus
              <select
                value={newUser.campus}
                onChange={(event) =>
                  setNewUser({ ...newUser, campus: event.target.value })
                }
              >
                {colleges[newUser.college].map((campus) => (
                  <option key={campus} value={campus}>
                    {campus}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Program
              <input
                value={newUser.program}
                onChange={(event) =>
                  setNewUser({ ...newUser, program: event.target.value })
                }
                required
              />
            </label>

            <label>
              Role
              <select
                value={newUser.role}
                onChange={(event) =>
                  setNewUser({ ...newUser, role: event.target.value })
                }
              >
                <option value="student">student</option>
                <option value="admin">admin</option>
              </select>
            </label>

            <button className="admin-add-button" type="submit">
              Save User
            </button>
          </form>
        </Card>
      )}

      <Card className="admin-table-card">
        <table className="admin-table">
          <thead>
  <tr>
    <th>
      <button className="admin-sort-button" onClick={() => handleSort("fullName")}>
        Name
        <span className="material-symbols-rounded">{sortIcon("fullName")}</span>
      </button>
    </th>

    <th>
      <button className="admin-sort-button" onClick={() => handleSort("email")}>
        Email
        <span className="material-symbols-rounded">{sortIcon("email")}</span>
      </button>
    </th>

    <th>
      <button className="admin-sort-button" onClick={() => handleSort("college")}>
        College
        <span className="material-symbols-rounded">{sortIcon("college")}</span>
      </button>
    </th>

    <th>
      <button className="admin-sort-button" onClick={() => handleSort("campus")}>
        Campus
        <span className="material-symbols-rounded">{sortIcon("campus")}</span>
      </button>
    </th>

    <th>
      <button className="admin-sort-button" onClick={() => handleSort("program")}>
        Program
        <span className="material-symbols-rounded">{sortIcon("program")}</span>
      </button>
    </th>

    <th>
      <button className="admin-sort-button" onClick={() => handleSort("role")}>
        Role
        <span className="material-symbols-rounded">{sortIcon("role")}</span>
      </button>
    </th>

    <th>
      <button className="admin-sort-button" onClick={() => handleSort("status")}>
        Status
        <span className="material-symbols-rounded">{sortIcon("status")}</span>
      </button>
    </th>

    <th>Actions</th>
  </tr>
</thead>

          <tbody>
            {sortedUsers.map((user) => {
              const isEditing = editingUserId === user.id;
              const selectedCollege = editForm.college || "Sheridan";

              return (
                <tr key={user.id}>
                  <td>
                    {isEditing ? (
                      <input
                        value={editForm.fullName}
                        onChange={(event) =>
                          setEditForm({ ...editForm, fullName: event.target.value })
                        }
                      />
                    ) : (
                      user.fullName
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        value={editForm.email}
                        onChange={(event) =>
                          setEditForm({ ...editForm, email: event.target.value })
                        }
                      />
                    ) : (
                      user.email
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <select
                        value={editForm.college}
                        onChange={(event) =>
                          setEditForm({
                            ...editForm,
                            college: event.target.value,
                            campus: colleges[event.target.value][0],
                          })
                        }
                      >
                        {Object.keys(colleges).map((college) => (
                          <option key={college} value={college}>
                            {college}
                          </option>
                        ))}
                      </select>
                    ) : (
                      user.college || "Not selected"
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <select
                        value={editForm.campus}
                        onChange={(event) =>
                          setEditForm({ ...editForm, campus: event.target.value })
                        }
                      >
                        {colleges[selectedCollege].map((campus) => (
                          <option key={campus} value={campus}>
                            {campus}
                          </option>
                        ))}
                      </select>
                    ) : (
                      user.campus || "Not selected"
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        value={editForm.program}
                        onChange={(event) =>
                          setEditForm({ ...editForm, program: event.target.value })
                        }
                      />
                    ) : (
                      user.program
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <select
                        value={editForm.role}
                        onChange={(event) =>
                          setEditForm({ ...editForm, role: event.target.value })
                        }
                      >
                        <option value="student">student</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      user.role
                    )}
                  </td>

                  <td>
                    <span
                      className={`admin-status ${
                        user.status === "Blocked" ? "blocked" : "active"
                      }`}
                    >
                      {user.status || "Active"}
                    </span>
                  </td>

                  <td>
                    <div className="admin-row-actions">
                      {isEditing ? (
                        <>
                          <button type="button" onClick={() => saveUser(user.id)}>
                            Save
                          </button>
                          <button type="button" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => startEdit(user)}>
                            Edit
                          </button>
                          <button type="button" onClick={() => toggleBlock(user)}>
                            {user.status === "Blocked" ? "Unblock" : "Block"}
                          </button>
                          <button
                            type="button"
                            className="danger-button"
                            onClick={() => deleteUser(user.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}