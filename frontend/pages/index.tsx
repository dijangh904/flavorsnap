/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from "react";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetStaticProps } from "next";
import Layout from "@/components/Layout";

export default function Classify() {
  const { t } = useTranslation("common");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classification, setClassification] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setClassification(null);
    
    // Bypass compression and just show the raw image
    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
  };

  const handleClassify = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);

    // Mock API call to prevent further errors while testing UI
    setTimeout(() => {
      setClassification({ result: "Looks delicious! (Mock Data)" });
      setLoading(false);
    }, 1000);
  };

  return (
    <Layout title="FlavorSnap - AI Food Classification" description="Instantly identify food with AI-powered image recognition">
      <div className="flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold mb-6">{t("snap_your_food")} 🍛</h1>

        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => setError(null)}
            onDismiss={() => setError(null)}
          />
        )}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-accent text-white px-6 py-3 rounded-full mb-4 focus:outline-none focus:ring-4 focus:ring-accent/50 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          {t("open_camera")}
        </button>
        
        {image && (
          <div className="mt-6 text-center">
            <img
              src={image}
              alt={t("preview_alt")}
              className="rounded-xl shadow-md max-w-sm mx-auto mb-4"
            />

            <button
              onClick={handleClassify}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? t('classifying') : t('classify_food')}
            </button>

            {classification && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg max-w-sm mx-auto">
                <h3 className="font-semibold text-green-800 dark:text-green-100 mb-2">{t('classification_result')}:</h3>
                <p className="text-green-700 dark:text-green-200">{JSON.stringify(classification, null, 2)}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"])),
  },
});