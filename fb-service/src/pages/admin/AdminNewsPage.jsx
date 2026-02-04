import { useEffect, useState } from "react";
import newsService from "../../services/adminNewsService";

const AdminNewsPage = () => {
    const [news, setNews] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        title: "",
        content: "",
        image: "",
        isPublished: false
    });

    const loadData = async () => {
        setNews(await newsService.getAll());
    };

    useEffect(() => {   
        loadData();
    }, []);

    const submit = async () => {
        if (!form.title.trim()) {
            alert("Заголовок обязателен");
            return;
        }

        if (editingId) {
            await newsService.update(editingId, form);
        } else {
            await newsService.create(form);
        }

        setForm({ title: "", content: "", image: "", isPublished: false });
        setEditingId(null);
        loadData();
    };

    const editNews = (n) => {
        setEditingId(n.newId);
        setForm({
            title: n.title,
            content: n.content ?? "",
            image: n.image ?? "",
            isPublished: n.isPublished
        });
    };

    const remove = async (id) => {
        if (!window.confirm("Удалить новость?")) return;
        await newsService.remove(id);
        loadData();
    };

    const toggleStatus = async (n) => {
        await newsService.toggleStatus(n.newId, !n.isPublished);
        loadData();
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <h1 className="text-2xl font-semibold">Новости</h1>

            <section className="rounded-lg border bg-white dark:bg-slate-950 p-6 space-y-4">
                <h2 className="text-lg font-medium">
                    {editingId ? "Редактирование новости" : "Добавить новость"}
                </h2>

                <input
                    placeholder="Заголовок"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full rounded-md border px-3 py-2 dark:bg-slate-900"
                />

                <textarea
                    placeholder="Текст новости"
                    value={form.content}
                    onChange={e => setForm({ ...form, content: e.target.value })}
                    className="w-full h-32 rounded-md border px-3 py-2 dark:bg-slate-900"
                />

                <input
                    placeholder="URL изображения (необязательно)"
                    value={form.image}
                    onChange={e => setForm({ ...form, image: e.target.value })}
                    className="w-full rounded-md border px-3 py-2 dark:bg-slate-900"
                />

                <div className="flex justify-between items-center">
                    <label className="flex gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.isPublished}
                            onChange={e =>
                                setForm({ ...form, isPublished: e.target.checked })
                            }
                        />
                        Опубликовано
                    </label>

                    <button
                        onClick={submit}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                        {editingId ? "Сохранить" : "Создать"}
                    </button>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-medium">Список новостей</h2>

                {news.map(n => (
                    <div
                        key={n.newId}
                        className="rounded-lg border bg-white dark:bg-slate-950 p-4"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-medium">{n.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {n.content}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 text-sm">
                                <button
                                    onClick={() => toggleStatus(n)}
                                    className="text-blue-600 hover:underline"
                                >
                                    {n.isPublished ? "Снять с публикации" : "Опубликовать"}
                                </button>

                                <button
                                    onClick={() => editNews(n)}
                                    className="text-yellow-600 hover:underline"
                                >
                                    Редактировать
                                </button>

                                <button
                                    onClick={() => remove(n.newId)}
                                    className="text-red-600 hover:underline"
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>

                        <div className="mt-2 text-xs text-gray-500">
                            Автор: {n.author} •{" "}
                            {n.isPublished ? "опубликовано" : "черновик"}
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
};

export default AdminNewsPage;
