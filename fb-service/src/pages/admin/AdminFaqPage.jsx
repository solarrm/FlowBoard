import { useEffect, useState } from "react";
import faqService from "../../services/adminFaqService";

const AdminFaqPage = () => {
    const [faqs, setFaqs] = useState([]);
    const [categories, setCategories] = useState([]);
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

    const submit = async () => {
        if (!form.categoryIds.length) {
            alert("Выберите хотя бы одну категорию");
            return;
        }

        await faqService.createFaq(form);
        setForm({ question: "", answer: "", isActive: true, categoryIds: [] });
        loadData();
    };

    const toggleCategory = (id) => {
        setForm(prev => ({
            ...prev,
            categoryIds: prev.categoryIds.includes(id)
                ? prev.categoryIds.filter(x => x !== id)
                : [...prev.categoryIds, id]
        }));
    };

    return (
        <div>
            <h2>FAQ</h2>

            <h3>Добавить вопрос</h3>

            <input
                placeholder="Вопрос"
                value={form.question}
                onChange={e => setForm({ ...form, question: e.target.value })}
            />

            <textarea
                placeholder="Ответ"
                value={form.answer}
                onChange={e => setForm({ ...form, answer: e.target.value })}
            />

            <div>
                <strong>Категории:</strong>
                {categories.map(c => (
                    <label key={c.categoryId} style={{ display: "block" }}>
                        <input
                            type="checkbox"
                            checked={form.categoryIds.includes(c.categoryId)}
                            onChange={() => toggleCategory(c.categoryId)}
                        />
                        {c.categoryName}
                    </label>
                ))}
            </div>

            <label>
                <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm({ ...form, isActive: e.target.checked })}
                />
                Опубликовано
            </label>

            <button onClick={submit}>Сохранить</button>

            <hr />

            <h3>Список FAQ</h3>

            {faqs.map(f => (
                <div key={f.faqId} style={{ borderBottom: "1px solid #ddd", marginBottom: "10px" }}>
                    <b>{f.question}</b>
                    <p>{f.answer}</p>
                    <small>
                        Категории: {f.categories.map(c => c.categoryName).join(", ")}
                    </small>
                    <br />
                    <small>Активен: {f.isActive ? "да" : "нет"}</small>
                </div>
            ))}
        </div>
    );
};

export default AdminFaqPage;
