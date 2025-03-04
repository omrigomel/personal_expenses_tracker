import React, { useState, useEffect } from "react";

const ExternalAPI = () => {
    const [data, setData] = useState([]);
    const symbols = ["AAPL", "MSFT", "AMZN", "SPY", "NVDA", "TSLA", "META", "GOOG"];
    const apiKey = "cu788j1r01qkuccsd0rgcu788j1r01qkuccsd0s0";


    const fetchAllSymbols = async () => {
        try {
            const results = await Promise.all(
                symbols.map(async (symbol) => {
                    const response = await fetch(
                        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
                    );
                    const result = await response.json();
                    return {
                        symbol,
                        price: result.c || "N/A",
                        changePercent: result.pc
                            ? (((result.c - result.pc) / result.pc) * 100).toFixed(2)
                            : "N/A",
                        changeValue:
                            result.pc && result.c ? (result.c - result.pc).toFixed(2) : "N/A",
                    };
                })
            );
            return results;
        } catch (error) {
            console.error("Error fetching symbols:", error);
            return [];
        }
    };

    // func for retrieve and save in Local Storage
    const fetchDataAndCache = async () => {
        console.log("Fetching new data from API...");
        const fetchedData = await fetchAllSymbols();
        setData(fetchedData);
        localStorage.setItem(
            "stockData",
            JSON.stringify({
                data: fetchedData,
                lastFetch: Date.now(),
            })
        );
    };

    useEffect(() => {
        //check local storage
        const cached = localStorage.getItem("stockData");
        if (cached) {
            const { data: cachedData, lastFetch } = JSON.parse(cached);


            const CACHE_DURATION = 15 * 1000; // 15 שניות
            if (Date.now() - lastFetch < CACHE_DURATION) {

                console.log("Loading data from Local Storage (still fresh)");
                setData(cachedData);
            } else {
                // old cache - new data
                fetchDataAndCache();
            }
        } else {
            // api request
            fetchDataAndCache();
        }

        // refresh every 15 sec
        const intervalId = setInterval(() => {
            fetchDataAndCache();
        }, 15000);


        return () => clearInterval(intervalId);
    }, []);

    return (
        <div
            style={{
                padding: "10px",
                background: "bg-white",
                color: "#000",
                borderRadius: "5px",
            }}
        >
            <h3
                className="text-lg font-bold mb-4"
                style={{ color: "#000", textAlign: "center" }}
            >
                Stocks
            </h3>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: "10px",
                }}
            >
                {data.length > 0 ? (
                    data.map((item, index) => (
                        <div
                            key={index}
                            style={{
                                background: "#f1f2f4",
                                padding: "10px",
                                borderRadius: "5px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                color: "#404040",
                            }}
                        >
                            <div style={{ textAlign: "left" }}>
                                <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                                    {item.symbol}
                                </div>
                                {item.changePercent !== "N/A" ? (
                                    <div
                                        style={{
                                            color: item.changePercent >= 0 ? "#22c55e" : "#ef4444",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {item.changePercent >= 0 ? "↑" : "↓"} {item.changePercent}%
                                        ({item.changeValue})
                                    </div>
                                ) : (
                                    <div style={{ fontSize: "12px", fontWeight: "bold" }}>N/A</div>
                                )}
                            </div>
                            <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                                {item.price}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Loading data...</p>
                )}
            </div>
        </div>
    );
};

export default ExternalAPI;
