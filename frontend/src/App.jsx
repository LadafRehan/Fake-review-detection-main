import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a JSON file first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Read the file as text
      const text = await file.text();
      const parsedJson = JSON.parse(text);

      // Validate structure
      if (!Array.isArray(parsedJson)) {
        throw new Error("JSON must be an array of review objects.");
      }

      // Check required keys
      const isValid = parsedJson.every(
        (item) => item.Review_Text && typeof item.Rating !== "undefined"
      );

      if (!isValid) {
        throw new Error("Each review must contain 'Review_Text' and 'Rating'.");
      }

      const response = await axios.post("http://127.0.0.1:5000/analyze", {
        reviews: parsedJson,
      });

      setResult(response.data);
    } catch (err) {
      console.error("Error processing file:", err);
      setError(err.message || "Error processing file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-white items-center justify-center gradient-bg-services p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="blue-glassmorphism shadow-lg rounded-lg p-6 w-full max-w-xl"
      >
        <h1 className="text-2xl font-bold text-white mb-4 text-center">
          Fake Product Review Detection System
        </h1>

        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="block w-full p-2 border rounded mb-4"
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleUpload}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Upload JSON
        </motion.button>

        {loading && <p className="text-center text-blue-500 mt-2">Processing...</p>}
        {error && <p className="text-center text-red-500 mt-2">{error}</p>}

        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-6 p-4 white-glassmorphism rounded-md shadow"
          >
            <h2 className="text-lg font-semibold">Results:</h2>
            <p>Total Reviews: {result.total_reviews}</p>
            <p>Fake Reviews: {result.fake_reviews}</p>
            <p>Fake Percentage: {result.fake_percentage.toFixed(2)}%</p>

            <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.fake_percentage}%` }}
                transition={{ duration: 1 }}
                className={`h-3 rounded-full ${
                  result.fake_percentage >= 50
                    ? "bg-red-500"
                    : result.fake_percentage >= 25
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              ></motion.div>
            </div>

            <p className="mt-2 font-bold text-lg text-center">
              Status:{" "}
              <span
                className={`${
                  result.fake_percentage >= 50
                    ? "text-red-600"
                    : result.fake_percentage >= 25
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {result.product_status}
              </span>
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default App;
