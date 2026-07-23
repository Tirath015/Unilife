import React, { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { getPasswordErrors } from "../../utils/validators";
import { adminLocalService } from "../services/adminLocalService";

const emptyUserForm = {
  fullName: "",
  email: "",
  password: "",
  studentId: "",
  program: "Computer Systems Technology",
  campus: "Main Campus",
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
    setEditForm(user);
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
                onChange={(e) =>
                  setNewUser({ ...newUser, fullName: e.target.value })
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
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
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
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
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
              Student ID
              <input
                value={newUser.studentId}
                onChange={(e) =>
                  setNewUser({ ...newUser, studentId: e.target.value })
                }
                placeholder="C1234567"
                required
              />
            </label>

            <label>
              Program
              <input
                value={newUser.program}
                onChange={(e) =>
                  setNewUser({ ...newUser, program: e.target.value })
                }
                required
              />
            </label>

            <label>
              Campus
              <input
                value={newUser.campus}
                onChange={(e) =>
                  setNewUser({ ...newUser, campus: e.target.value })
                }
                required
              />
            </label>

            <label>
              Role
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
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
              <th>Name</th>
              <th>Email</th>
              <th>Student ID</th>
              <th>Program</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => {
              const isEditing = editingUserId === user.id;

              return (
                <tr key={user.id}>
                  <td>
                    {isEditing ? (
                      <input
                        value={editForm.fullName}
                        onChange={(e) =>
                          setEditForm({ ...editForm, fullName: e.target.value })
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
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                      />
                    ) : (
                      user.email
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        value={editForm.studentId}
                        onChange={(e) =>
                          setEditForm({ ...editForm, studentId: e.target.value })
                        }
                      />
                    ) : (
                      user.studentId
                    )}
                  </td>

                  <td>
                    {isEditing ? (
                      <input
                        value={editForm.program}
                        onChange={(e) =>
                          setEditForm({ ...editForm, program: e.target.value })
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
                        onChange={(e) =>
                          setEditForm({ ...editForm, role: e.target.value })
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
