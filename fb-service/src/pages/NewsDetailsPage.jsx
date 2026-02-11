import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import newsService from '../services/publicNewsService';

const NewsDetailsPage = () => {
    const { id } = useParams();
    const [news, setNews] = useState(null);

    useEffect(() => {
        newsService.getById(id).then(setNews);
    }, [id]);

    if (!news) return <p className="p-6">Загрузка...</p>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-4">
            <h1 className="text-2xl font-semibold">{news.title}</h1>

            <p className="text-sm text-gray-500">
                {new Date(news.publishedAt || news.createdAt).toLocaleString()}
            </p>

            {news.image && (
                <img
                    src={news.image}
                    alt=""
                    className="w-full max-h-96 object-cover rounded"
                />
            )}

            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {news.content}
            </div>
        </div>
    );
};

export default NewsDetailsPage;