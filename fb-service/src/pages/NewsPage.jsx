import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import newsService from '../services/publicNewsService';

const NewsPage = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        setNews(await newsService.getAll());
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-semibold">Новости</h1>

            {loading && <p>Загрузка...</p>}

            <div className="space-y-4">
                {news.map(n => (
                    <Link
                        key={n.newId}
                        to={`/news/${n.newId}`}
                        className="block rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 hover:shadow"
                    >
                        {n.image && (
                            <img
                                src={n.image}
                                alt=""
                                className="mb-3 max-h-64 w-full object-cover rounded"
                            />
                        )}

                        <h2 className="text-lg font-medium">{n.title}</h2>

                        <p className="text-sm text-gray-500 mt-1">
                            {new Date(n.publishedAt || n.createdAt).toLocaleString()}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default NewsPage;