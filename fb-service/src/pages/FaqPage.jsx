import { useEffect, useState } from "react";
import faqService from '../services/publicFaqService';

const FaqPage = () => {
    const [faqs, setFaqs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadData = async (categoryId) => {
        setLoading(true);
        const [f, c] = await Promise.all([
            faqService.getFaqs(categoryId),
            faqService.getCategories()
        ]);
        setFaqs(f);
        setCategories(c);
        setLoading(false);
    };

    useEffect(() => {
        loadData(selectedCategory);
    }, [selectedCategory]);

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">

            <h1 className="text-2xl font-semibold">FAQ</h1>

            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1 rounded-md border ${selectedCategory === null
                            ? "bg-blue-600 text-white"
                            : "border-gray-300 dark:border-slate-700"
                        }`}
                >
                    Все
                </button>

                {categories.map(c => (
                    <button
                        key={c.categoryId}
                        onClick={() => setSelectedCategory(c.categoryId)}
                        className={`px-3 py-1 rounded-md border ${selectedCategory === c.categoryId
                                ? "bg-blue-600 text-white"
                                : "border-gray-300 dark:border-slate-700"
                            }`}
                    >
                        {c.categoryName}
                    </button>
                ))}
            </div>

            {loading && <p>Загрузка...</p>}

            {!loading && faqs.length === 0 && (
                <p className="text-gray-500">Вопросов пока нет</p>
            )}

            <div className="space-y-3">
                {faqs.map(f => (
                    <details
                        key={f.faqId}
                        className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4"
                    >
                        <summary className="cursor-pointer font-medium">
                            {f.question}
                        </summary>

                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                            {f.answer}
                        </p>

                        <div className="mt-2 text-xs text-gray-400">
                            {f.categories.map(c => c.categoryName).join(", ")}
                        </div>
                    </details>
                ))}
            </div>
        </div>
    );
};

export default FaqPage;