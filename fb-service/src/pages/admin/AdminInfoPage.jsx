import { useEffect, useState } from "react";
import infoService from "../../services/adminInfoService";

const AdminInfoPage = () => {
    const [form, setForm] = useState({
        serviceName: "",
        decription: "",
        version: "",
        contacts: "",
        websiteUrl: ""
    });

    useEffect(() => {
        infoService.get().then(data => {
            if (data) setForm(data);
        });
    }, []);

    const submit = async () => {
        await infoService.update(form);
        alert("Информация обновлена");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-semibold">Информация о проекте</h1>

            <div className="space-y-4 rounded-lg border bg-white dark:bg-slate-950 p-6">
                <input
                    placeholder="Название сервиса"
                    value={form.serviceName || ""}
                    onChange={e => setForm({ ...form, serviceName: e.target.value })}
                    className="w-full rounded-md border px-3 py-2 dark:bg-slate-900"
                />

                <textarea
                    placeholder="Описание"
                    value={form.decription || ""}
                    onChange={e => setForm({ ...form, decription: e.target.value })}
                    className="w-full h-32 rounded-md border px-3 py-2 dark:bg-slate-900"
                />

                <input
                    placeholder="Версия"
                    value={form.version || ""}
                    onChange={e => setForm({ ...form, version: e.target.value })}
                    className="w-full rounded-md border px-3 py-2 dark:bg-slate-900"
                />

                <input
                    placeholder="Контакты"
                    value={form.contacts || ""}
                    onChange={e => setForm({ ...form, contacts: e.target.value })}
                    className="w-full rounded-md border px-3 py-2 dark:bg-slate-900"
                />

                <input
                    placeholder="Website URL"
                    value={form.websiteUrl || ""}
                    onChange={e => setForm({ ...form, websiteUrl: e.target.value })}
                    className="w-full rounded-md border px-3 py-2 dark:bg-slate-900"
                />

                <button
                    onClick={submit}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                    Сохранить
                </button>
            </div>
        </div>
    );
};

export default AdminInfoPage;