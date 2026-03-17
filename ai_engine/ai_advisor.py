import os
from ollama import AsyncClient
import json
from dotenv import load_dotenv

load_dotenv()

class AIAdvisor:
    def __init__(self):
        self.host = os.getenv("OLLAMA_HOST", "https://api.ollama.com")
        self.api_key = os.getenv("OLLAMA_API_KEY")
        self.model = os.getenv("OLLAMA_MODEL", "ministral-3:8b")
        # Use AsyncClient for non-blocking backend calls
        self.client = AsyncClient(host=self.host, headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else {})

    async def analyze_mustahik_priority(self, mustahiks):
        """
        Memberikan narasi analitik untuk mustahik dengan prioritas tertinggi secara asynchronous.
        """
        if not mustahiks:
            return "Belum ada data mustahik untuk dianalisis."

        top_mustahik = mustahiks[0]
        
        prompt = f"""
        Kamu adalah AI Advisor untuk lembaga zakat ZakatTrack. 
        Analisis data mustahik berikut dan berikan rekomendasi singkat dalam Bahasa Indonesia (maks 3 kalimat).
        
        Data Mustahik Teratas:
        - Nama: {top_mustahik['name']}
        - Kategori: {top_mustahik['asnaf_category']}
        - Skor SAW: {top_mustahik['priority_score']:.2f}
        - Pendapatan: Rp {top_mustahik['income']:,}
        - Tanggungan: {top_mustahik['dependents']} orang
        - Pilar SDG: {top_mustahik['sdgs_label']}
        
        Tugas: Berikan alasan teknis mengapa orang ini menjadi prioritas utama dan saran jenis penyaluran yang paling tepat.
        """

        try:
            response = await self.client.chat(model=self.model, messages=[
                {'role': 'user', 'content': prompt}
            ])
            return response['message']['content']
        except Exception as e:
            return f"AI Advisor (Cloud) sedang tidak tersedia: {str(e)}"

    async def get_distribution_strategy(self, stats):
        """
        Memberikan narasi strategi distribusi secara asynchronous.
        """
        prompt = f"""
        Berdasarkan statistik zakat:
        - Total Terkumpul: Rp {stats['totalDist']:,}
        - Fokus SDG 1 (Kemiskinan): {stats['sdg1']}%
        - Fokus SDG 2 (Kelaparan): {stats['sdg2']}%
        
        Berikan 1 kalimat saran strategis untuk meningkatkan dampak sosial ke depannya (Bahasa Indonesia).
        """
        
        try:
            response = await self.client.chat(model=self.model, messages=[
                {'role': 'user', 'content': prompt}
            ])
            return response['message']['content']
        except Exception as e:
            return "Gagal mendapatkan saran AI."
