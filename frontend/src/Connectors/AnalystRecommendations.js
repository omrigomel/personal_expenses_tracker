import React, { useState, useEffect } from "react";
import axios from "axios";

const FINNHUB_TOKEN = "cu788j1r01qkuccsd0rgcu788j1r01qkuccsd0s0";
const TICKERS = ["AAPL", "MSFT", "AMZN", "GOOG", "NVDA", "TSLA", "META"];
const CACHE_DURATION = 60 * 10000; //refresh every 10 min


const TRADINGVIEW_LINKS = {
    AAPL: "https://www.tradingview.com/symbols/NASDAQ-AAPL/",
    MSFT: "https://www.tradingview.com/symbols/NASDAQ-MSFT/",
    AMZN: "https://www.tradingview.com/symbols/NASDAQ-AMZN/",
    GOOG: "https://www.tradingview.com/symbols/NASDAQ-GOOG/",
    NVDA: "https://www.tradingview.com/symbols/NASDAQ-NVDA/",
    TSLA: "https://www.tradingview.com/symbols/NASDAQ-TSLA/",
    META: "https://www.tradingview.com/symbols/NASDAQ-META/"

};

function AnalystRecommendations() {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // שלב 1: שליפה מה-API
    const fetchRecommendationsFromAPI = async () => {
        setLoading(true);
        setError("");
        const results = [];

        for (let symbol of TICKERS) {
            try {
                const url = "https://finnhub.io/api/v1/stock/recommendation";
                const { data } = await axios.get(url, {
                    params: {
                        symbol,
                        token: FINNHUB_TOKEN,
                    },
                });

                if (data.length > 0) {
                    const latest = data[0];
                    results.push({
                        symbol,
                        period: latest.period,
                        strongBuy: latest.strongBuy || 0,
                        buy: latest.buy || 0,
                        hold: latest.hold || 0,
                        sell: latest.sell || 0,
                        strongSell: latest.strongSell || 0,
                    });
                } else {
                    results.push({
                        symbol,
                        period: "N/A",
                        strongBuy: 0,
                        buy: 0,
                        hold: 0,
                        sell: 0,
                        strongSell: 0,
                    });
                }
            } catch (err) {
                console.error("Error fetching recommendation for", symbol, err);
                setError(`Failed to fetch data for ${symbol}`);
            }
        }

        setRecommendations(results);
        setLoading(false);


        localStorage.setItem(
            "analystData",
            JSON.stringify({
                data: results,
                lastFetch: Date.now(),
            })
        );
    };


    const checkCacheAndFetch = async () => {
        const cached = localStorage.getItem("analystData");
        if (cached) {
            const { data, lastFetch } = JSON.parse(cached);
            if (Date.now() - lastFetch < CACHE_DURATION) {
                console.log("Loading analyst data from Local Storage (still fresh)");
                setRecommendations(data);
                return;
            }
        }
        fetchRecommendationsFromAPI();
    };


    useEffect(() => {
        checkCacheAndFetch();

        const intervalId = setInterval(() => {
            fetchRecommendationsFromAPI();
        }, CACHE_DURATION);

        return () => clearInterval(intervalId);
    }, []);

    // הצגה
    if (loading) {
        return <p>Loading analyst recommendations...</p>;
    }
    if (error) {
        return <p style={{ color: "red" }}>{error}</p>;
    }

    return (
        <div style={{ background: "white", padding: "10px", marginTop: "20px" }}>
            <h3 className="text-lg font-bold mb-4" style={{ textAlign: "center" }}>
                Analyst Recommendations
            </h3>
            {recommendations.length === 0 ? (
                <p>No data</p>
            ) : (
                <table className="min-w-full border text-center">
                    <thead>
                    <tr>
                        <th className="border px-2 py-1">Symbol</th>
                        <th className="border px-2 py-1">Period</th>
                        <th className="border px-2 py-1">Strong Buy</th>
                        <th className="border px-2 py-1">Buy</th>
                        <th className="border px-2 py-1">Hold</th>
                        <th className="border px-2 py-1">Sell</th>
                        <th className="border px-2 py-1">Strong Sell</th>
                    </tr>
                    </thead>
                    <tbody>
                    {recommendations.map((item, idx) => {

                        const link = TRADINGVIEW_LINKS[item.symbol] || null;

                        return (
                            <tr key={idx}>
                                <td className="border px-2 py-1">
                                    {link ? (
                                        <a
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: "blue", textDecoration: "underline" }}
                                        >
                                            {item.symbol}
                                        </a>
                                    ) : (
                                        item.symbol
                                    )}
                                </td>
                                <td className="border px-2 py-1">{item.period}</td>
                                <td className="border px-2 py-1">{item.strongBuy}</td>
                                <td className="border px-2 py-1">{item.buy}</td>
                                <td className="border px-2 py-1">{item.hold}</td>
                                <td className="border px-2 py-1">{item.sell}</td>
                                <td className="border px-2 py-1">{item.strongSell}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AnalystRecommendations;
