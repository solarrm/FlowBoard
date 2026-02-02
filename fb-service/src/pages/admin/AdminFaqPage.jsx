import { useEffect, useState } from "react";
import faqService from "../../services/adminFaqService";

const AdminFaqPage = () => {
    const [faqs, setFaqs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");

    const [form, setForm] = useState({
        question: "",
        answer: "",
        isActive: true,
        categoryIds: []
    });

    const loadData = async () => {
        setFaqs(await faqService.getFaqs());
        setCategories(await faqService.getCategories());
    };

    useEffect(() => {
        loadData();
    }, []);

    const submitFaq = async () => {
        if (!form.categoryIds.length) {
            alert("Выберите хотя бы одну категорию");
            return;
        }

        await faqService.createFaq(form);
        setForm({ question: "", answer: "", isActive: true, categoryIds: [] });
        loadData();
    };

    const deleteFaq = async (id) => {
        if (!window.confirm("Удалить FAQ?")) return;
        await faqService.deleteFaq(id);
        loadData();
    };

    const toggleStatus = async (faq) => {
        await faqService.updateFaqStatus(faq.faqId, !faq.isActive);
        loadData();
    };

    const addCategory = async () => {
        if (!newCategory.trim()) return;
        await faqService.createCategory(newCategory);
        setNewCategory("");
        loadData();
    };

    const removeCategory = async (id) => {
        if (!window.confirm("Удалить категорию?")) return;

        try {
            await faqService.deleteCategory(id);
            loadData();
        } catch {
            alert("Категория используется в FAQ");
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <h1 className="text-2xl font-semibold">FAQ</h1>

            <section className="rounded-lg border bg-white dark:bg-slate-950 p-6 space-y-4">
                <h2 className="text-lg font-medium">Добавить вопрос</h2>

                <input
                    placeholder="Вопрос"
                    value={form.question}
                    onChange={e => setForm({ ...form, question: e.target.value })}
                    className="w-full rounded-md border px-3 py-2 dark:bg-slate-900"
                />

                <textarea
                    placeholder="Ответ"
                    value={form.answer}
                    onChange={e => setForm({ ...form, answer: e.target.value })}
                    className="w-full h-28 rounded-md border px-3 py-2 dark:bg-slate-900"
                />

                <select
                    multiple
                    value={form.categoryIds}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            categoryIds: Array.from(
                                e.target.selectedOptions,
                                o => Number(o.value)
                            )
                        })
                    }
                    className="w-full h-32 rounded-md border px-3 py-2 dark:bg-slate-900"
                >
                    {categories.map(c => (
                        <option key={c.categoryId} value={c.categoryId}>
                            {c.categoryName}
                        </option>
                    ))}
                </select>

                <div className="flex justify-between items-center">
                    <label className="flex gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={e =>
                                setForm({ ...form, isActive: e.target.checked })
                            }
                        />
                        Опубликовано
                    </label>

                    <button
                        onClick={submitFaq}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                        Сохранить
                    </button>
                </div>
            </section>

            <section className="rounded-lg border bg-white dark:bg-slate-950 p-6 space-y-4">
                <h2 className="text-lg font-medium">Категории</h2>

                <div className="flex gap-2">
                    <input
                        placeholder="Название категории"
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                        className="flex-1 rounded-md border px-3 py-2 dark:bg-slate-900"
                    />
                    <button
                        onClick={addCategory}
                        className="bg-blue-600 text-white px-4 rounded-md"
                    >
                        Добавить
                    </button>
                </div>

                <ul className="space-y-2">
                    {categories.map(c => (
                        <li
                            key={c.categoryId}
                            className="flex justify-between items-center"
                        >
                            <span>{c.categoryName}</span>
                            <button
                                onClick={() => removeCategory(c.categoryId)}
                                className="text-sm text-red-600 hover:underline"
                            >
                                Удалить
                            </button>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-medium">Список FAQ</h2>

                {faqs.map(f => (
                    <div
                        key={f.faqId}
                        className="rounded-lg border bg-white dark:bg-slate-950 p-4"
                    >
                        <h3 className="font-medium">{f.question}</h3>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {f.answer}
                        </p>

                        <div className="mt-3 flex justify-between items-center text-sm">
                            <span>
                                {f.categories.map(c => c.categoryName).join(", ")}
                            </span>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => toggleStatus(f)}
                                    className="text-blue-600 hover:underline"
                                >
                                    {f.isActive ? "Снять с публикации" : "Опубликовать"}
                                </button>

                                <button
                                    onClick={() => deleteFaq(f.faqId)}
                                    className="text-red-600 hover:underline"
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
};

export default AdminFaqPage;