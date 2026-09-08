export default function ConfirmationModal({ open, title, message, confirmLabel = "Confirm", loading = false, onCancel, onConfirm }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#132A36]/60 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-[#132A36]">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
                <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={onCancel} disabled={loading} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-[#132A36]">Cancel</button>
                    <button type="button" onClick={onConfirm} disabled={loading} className="rounded-lg bg-[#132A36] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Working..." : confirmLabel}</button>
                </div>
            </div>
        </div>
    );
}
