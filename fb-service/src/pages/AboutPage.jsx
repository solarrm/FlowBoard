import { useEffect, useState } from "react";
import infoService from "../services/publicInfoService";

const AboutPage = () => {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await infoService.get();
                setInfo(data);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    if (loading)
        return <div className="p-6">Загрузка...</div>;

    if (!info)
        return <div className="p-6">Информация недоступна</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">
                    {info.serviceName}
                </h1>

                {info.version && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Версия: {info.version}
                    </p>
                )}
            </div>

            {info.decription && (
                <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6">
                    <h2 className="text-lg font-semibold mb-3">
                        О сервисе
                    </h2>
                    <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                        {info.decription}
                    </p>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                {info.contacts && (
                    <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6">
                        <h3 className="font-semibold mb-2">Контакты</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            {info.contacts}
                        </p>
                    </div>
                )}

                {info.websiteUrl && (
                    <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6">
                        <h3 className="font-semibold mb-2">Официальный сайт</h3>
                        <a
                            href={info.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                        >
                            {info.websiteUrl}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AboutPage;