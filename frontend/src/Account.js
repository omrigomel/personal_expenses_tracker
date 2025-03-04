import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "./UserContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

function Account() {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    // If user not logged in, redirect
    useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);

    // ----- Profile editing state -----
    const [editMode, setEditMode] = useState(false);
    const [tempFullname, setTempFullname] = useState("");
    const [tempEmail, setTempEmail] = useState("");
    const [tempUsername, setTempUsername] = useState("");

    // ----- Password change state -----
    const [changePasswordMode, setChangePasswordMode] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passError, setPassError] = useState("");
    const [passSuccess, setPassSuccess] = useState("");

    // ----- Delete account state -----
    const [deleteAccountMode, setDeleteAccountMode] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deletePasswordConfirm, setDeletePasswordConfirm] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);

    // ----- Add Budget form state -----
    const [year, setYear] = useState("");
    const [month, setMonth] = useState("");
    const [budget, setBudget] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // -------------------------
    // 1) Add Budget
    // -------------------------
    const handleAddBudget = async () => {
        setError("");
        setSuccess("");


        const parsedYear = parseInt(year, 10);
        const parsedMonth = parseInt(month, 10);
        const parsedBudget = parseFloat(budget);


        if (parsedYear < 2000 || parsedYear > 2100) {
            setError("Year must be between 2000 and 2100.");
            return;
        }


        if (parsedMonth < 1 || parsedMonth > 12) {
            setError("Month must be between 1 and 12.");
            return;
        }


        if (isNaN(parsedBudget) || parsedBudget < 0) {
            setError("Budget must be a positive number.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/budgets/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    year: parsedYear,
                    month: parsedMonth,
                    budget: parsedBudget,
                    user_id: user?.id,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to add budget");
            }
            setSuccess("Budget added successfully!");
            setYear("");
            setMonth("");
            setBudget("");
        } catch (err) {
            console.error(err);
            setError("Error adding budget");
        }
    };

    // -------------------------
    // 2) Edit Profile (Username, Name, Email)
    // -------------------------
    const handleEditClick = () => {
        setTempUsername(user?.username || "");
        setTempFullname(user?.fullname || "");
        setTempEmail(user?.email || "");
        setEditMode(true);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
    };

    const handleSaveChanges = async () => {
        // Validation for fullname (letters only and up to 20 characters)
        const nameRegex = /^[A-Za-z\s]{1,20}$/;
        if (!nameRegex.test(tempFullname)) {
            alert("Fullname must contain only letters/spaces (up to 20 chars).");
            return;
        }
        const confirmed = window.confirm("Are you sure you want to save your changes?");
        if (!confirmed) return;

        try {
            const url = `http://localhost:8000/users/update-profile/${user.id}?fullname=${encodeURIComponent(
                tempFullname
            )}&username=${encodeURIComponent(
                tempUsername
            )}&email=${encodeURIComponent(tempEmail)}`;

            const response = await fetch(url, { method: "PUT" });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to update user");
            }

            await response.json();

            const updatedUser = {
                ...user,
                fullname: tempFullname,
                username: tempUsername,
                email: tempEmail,
            };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));

            alert("User updated successfully!");
            setEditMode(false);
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    // -------------------------
    // 3) Change Password
    // -------------------------
    const handleChangePasswordClick = () => {
        setChangePasswordMode(true);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPassError("");
        setPassSuccess("");
    };

    const handleCancelChangePassword = () => {
        setChangePasswordMode(false);
    };

    const handleSavePassword = async () => {
        setPassError("");
        setPassSuccess("");

        if (!oldPassword || !newPassword || !confirmPassword) {
            setPassError("All fields are required!");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPassError("New password and confirmation do not match!");
            return;
        }

        try {
            const url = `http://localhost:8000/users/update-password/${user.id}`;
            const response = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password: newPassword,
                    confirm_password: confirmPassword,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to update password");
            }

            setPassSuccess("Password updated successfully!");
            setTimeout(() => {
                setChangePasswordMode(false);
            }, 1500);
        } catch (err) {
            console.error(err);
            setPassError(err.message);
        }
    };

    // -------------------------
    // 4) Delete Account
    // -------------------------
    const handleDeleteAccountClick = () => {
        setDeleteAccountMode(true);
        setDeletePassword("");
        setDeletePasswordConfirm("");
        setDeleteError("");
        setShowConfirmPopup(false);
    };

    const handleCancelDelete = () => {
        setDeleteAccountMode(false);
    };

    const handleDeleteAccount = () => {

        if (!deletePassword || !deletePasswordConfirm) {
            setDeleteError("Please fill in both password fields.");
            return;
        }
        if (deletePassword !== deletePasswordConfirm) {
            setDeleteError("Passwords do not match!");
            return;
        }

        setShowConfirmPopup(true);
    };

    const confirmDeleteAccount = async () => {
        try {
            const response = await fetch("http://localhost:8000/users/", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: user.username,
                    email: user.email,
                    password: deletePassword,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to delete account");
            }

            alert("Account deleted successfully!");
            // מחיקת user מ-Local Storage
            localStorage.removeItem("user");
            setUser(null);
            navigate("/login");
        } catch (err) {
            setDeleteError(err.message);
        } finally {
            setShowConfirmPopup(false);
        }
    };

    const cancelConfirmDelete = () => {
        setShowConfirmPopup(false);
    };


    if (!user) return null;

    return (
        <div className="flex">
            <Sidebar activePage="account" />

            <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <h1 className="text-2xl font-bold mb-6">Your account</h1>

                {changePasswordMode ? (
                    // ----------- CHANGE PASSWORD MODE -----------
                    <div className="bg-white p-6 rounded shadow w-full max-w-md mb-8">
                        <h2 className="text-lg font-bold mb-4">Change Password</h2>
                        {passError && <p className="text-red-500 mb-2">{passError}</p>}
                        {passSuccess && <p className="text-green-500 mb-2">{passSuccess}</p>}

                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Old Password
                        </label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        />

                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        />

                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        />

                        <div className="flex space-x-2">
                            <button
                                onClick={handleSavePassword}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                            >
                                Save
                            </button>
                            <button
                                onClick={handleCancelChangePassword}
                                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : deleteAccountMode ? (
                    // ----------- DELETE ACCOUNT MODE -----------
                    <div className="bg-white p-6 rounded shadow w-full max-w-md mb-8">
                        <h2 className="text-lg font-bold mb-4">Delete Account</h2>
                        {deleteError && <p className="text-red-500 mb-2">{deleteError}</p>}

                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Current Password
                        </label>
                        <input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        />

                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Confirm Current Password
                        </label>
                        <input
                            type="password"
                            value={deletePasswordConfirm}
                            onChange={(e) => setDeletePasswordConfirm(e.target.value)}
                            className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        />

                        <div className="flex space-x-2">
                            <button
                                onClick={handleDeleteAccount}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                            >
                                Delete
                            </button>
                            <button
                                onClick={handleCancelDelete}
                                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* pop up "Are you sure?" */}
                        {showConfirmPopup && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                <div className="bg-white p-6 rounded shadow-md">
                                    <p className="mb-4">Are you sure you want to delete your account?</p>
                                    <div className="flex space-x-4">
                                        <button
                                            onClick={confirmDeleteAccount}
                                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                                        >
                                            Yes
                                        </button>
                                        <button
                                            onClick={cancelConfirmDelete}
                                            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                                        >
                                            No
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // ----------- NORMAL ACCOUNT MODE -----------
                    <>
                        <div className="bg-white p-6 rounded shadow w-full max-w-md mb-8">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Username
                            </label>
                            {editMode ? (
                                <input
                                    type="text"
                                    value={tempUsername}
                                    onChange={(e) => setTempUsername(e.target.value)}
                                    className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                />
                            ) : (
                                <input
                                    type="text"
                                    readOnly
                                    value={user.username || ""}
                                    className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                />
                            )}

                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Your name
                            </label>
                            {editMode ? (
                                <input
                                    type="text"
                                    value={tempFullname}
                                    onChange={(e) => setTempFullname(e.target.value)}
                                    className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                />
                            ) : (
                                <input
                                    type="text"
                                    readOnly
                                    value={user.fullname || ""}
                                    className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                />
                            )}

                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Email
                            </label>
                            {editMode ? (
                                <input
                                    type="email"
                                    value={tempEmail}
                                    onChange={(e) => setTempEmail(e.target.value)}
                                    className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                />
                            ) : (
                                <input
                                    type="text"
                                    readOnly
                                    value={user.email || ""}
                                    className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                />
                            )}

                            {editMode ? (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleSaveChanges}
                                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleEditClick}
                                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Edit Account
                                    </button>
                                    <button
                                        onClick={handleChangePasswordClick}
                                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Change Password
                                    </button>
                                    <button
                                        onClick={handleDeleteAccountClick}
                                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Delete Account
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Add Budget */}
                        <div className="bg-white p-6 rounded shadow w-full max-w-md">
                            <h2 className="text-lg font-bold mb-4">Add Budget</h2>

                            {error && <p className="text-red-500 mb-2">{error}</p>}
                            {success && <p className="text-green-500 mb-2">{success}</p>}

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Year
                                </label>
                                <input
                                    type="number"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                    placeholder="e.g. 2025"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Month
                                </label>
                                <input
                                    type="number"
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                    placeholder="1-12"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Budget
                                </label>
                                <input
                                    type="number"
                                    step="1"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                                    placeholder="e.g. 2000"
                                />
                            </div>

                            <button
                                onClick={handleAddBudget}
                                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                            >
                                Add Budget
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Account;
