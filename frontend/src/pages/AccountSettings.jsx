import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axios";
import DashboardAside from "../components/DashboardAside";
import { useAppContext } from "../context/AppContext";

export default function AccountSettings() {
    const { isAuthenticated, isAuthLoading, setUserData, userData, showToast } = useAppContext();
    const [profile, setProfile] = useState({ firstName: userData.firstName, lastName: userData.lastName, username: userData.username });
    const [password, setPassword] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        setProfile({ firstName: userData.firstName, lastName: userData.lastName, username: userData.username });
    }, [userData.firstName, userData.lastName, userData.username]);

    if (isAuthLoading) return <div className="flex min-h-screen items-center justify-center font-semibold">Loading...</div>;
    if (!isAuthenticated) return <Navigate to="/" replace />;

    const submitProfile = async (event) => {
        event.preventDefault();
        setSavingProfile(true);
        try {
            const response = await api.put("/auth/profile", profile);
            setUserData(response.data.user);
            showToast("Profile updated successfully.");
        } catch (error) {
            showToast(error.response?.data?.message || "Unable to update profile.", "error");
        } finally { setSavingProfile(false); }
    };

    const submitPassword = async (event) => {
        event.preventDefault();
        setSavingPassword(true);
        try {
            await api.put("/auth/password", password);
            setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
            showToast("Password changed. Please log in again.");
        } catch (error) {
            showToast(error.response?.data?.message || "Unable to change password.", "error");
        } finally { setSavingPassword(false); }
    };

    return <div className="flex min-h-screen flex-col border-t border-slate-300 bg-slate-100 py-4 md:flex-row">
        <DashboardAside />
        <main className="flex-1 px-6">
            <h1 className="text-2xl font-bold text-[#132A36]">ACCOUNT SETTINGS</h1>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <form onSubmit={submitProfile} className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-[#132A36]">Edit Profile</h2>
                    {[["firstName", "First name"], ["lastName", "Last name"], ["username", "Username"]].map(([name, label]) => <label key={name} className="flex flex-col gap-1 text-sm font-semibold text-[#132A36]">{label}<input required value={profile[name]} onChange={(event) => setProfile({ ...profile, [name]: event.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>)}
                    <button disabled={savingProfile} className="rounded-lg bg-[#132A36] py-2 font-semibold text-white disabled:opacity-60">{savingProfile ? "Saving..." : "Save Changes"}</button>
                </form>
                <form onSubmit={submitPassword} className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-[#132A36]">Change Password</h2>
                    {[['currentPassword', 'Current password'], ['newPassword', 'New password'], ['confirmPassword', 'Confirm new password']].map(([name, label]) => <label key={name} className="flex flex-col gap-1 text-sm font-semibold text-[#132A36]">{label}<input required type="password" value={password[name]} onChange={(event) => setPassword({ ...password, [name]: event.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>)}
                    <button disabled={savingPassword} className="rounded-lg bg-[#132A36] py-2 font-semibold text-white disabled:opacity-60">{savingPassword ? "Saving..." : "Change Password"}</button>
                </form>
            </div>
        </main>
    </div>;
}
