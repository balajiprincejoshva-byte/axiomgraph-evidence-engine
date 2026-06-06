import requests
import xml.etree.ElementTree as ET
from typing import List, Dict, Any
import datetime

PUBMED_ESEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
PUBMED_EFETCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"

import time

def search_pubmed(query: str, max_results: int = 5) -> List[str]:
    """
    Searches PubMed for a query and returns a list of PMIDs.
    """
    params = {
        "db": "pubmed",
        "retmode": "json",
        "retmax": max_results,
        "term": query
    }
    for attempt in range(3):
        try:
            response = requests.get(PUBMED_ESEARCH_URL, params=params, timeout=30)
            if response.status_code == 429:
                time.sleep(1)
                continue
            response.raise_for_status()
            data = response.json()
            pmids = data.get("esearchresult", {}).get("idlist", [])
            return pmids
        except Exception as e:
            print(f"Error searching PubMed (attempt {attempt+1}): {e}")
            time.sleep(1)
    return []

def fetch_abstracts(pmids: List[str]) -> List[Dict[str, Any]]:
    """
    Fetches the XML metadata and abstract for a list of PMIDs.
    """
    if not pmids:
        return []
    
    params = {
        "db": "pubmed",
        "retmode": "xml",
        "id": ",".join(pmids)
    }
    
    papers = []
    for attempt in range(3):
        try:
            response = requests.get(PUBMED_EFETCH_URL, params=params, timeout=30)
            if response.status_code == 429:
                time.sleep(1)
                continue
            response.raise_for_status()
            
            root = ET.fromstring(response.content)
            
            for article in root.findall(".//PubmedArticle"):
                pmid = article.findtext(".//PMID")
                title = article.findtext(".//ArticleTitle")
                
                # Extract Abstract
                abstract_texts = article.findall(".//AbstractText")
                abstract = " ".join([elem.text for elem in abstract_texts if elem.text])
                
                if not abstract:
                    continue # Skip papers without abstracts
                    
                # Extract Pub Year
                year = article.findtext(".//PubDate/Year")
                if not year:
                    medline_date = article.findtext(".//PubDate/MedlineDate")
                    if medline_date:
                        year = medline_date[:4]
                    else:
                        year = str(datetime.datetime.now().year)
                        
                # Extract Authors
                author_list = []
                for author in article.findall(".//Author"):
                    last_name = author.findtext("LastName")
                    initials = author.findtext("Initials")
                    if last_name:
                        author_list.append(f"{last_name} {initials}" if initials else last_name)
                authors = ", ".join(author_list) if author_list else "Unknown"
                
                # Identify source type and trust score based on PublicationType
                pub_types = [pt.text for pt in article.findall(".//PublicationType") if pt.text]
                source_type = "research_paper"
                trust_score = 4.0 # default baseline for basic research paper
    
                pub_type_str = " ".join(pub_types).lower()
                if "meta-analysis" in pub_type_str or "systematic review" in pub_type_str:
                    source_type = "meta_analysis"
                    trust_score = 9.0
                elif "clinical trial, phase iii" in pub_type_str or "clinical trial, phase iv" in pub_type_str:
                    source_type = "clinical_trial"
                    trust_score = 10.0
                elif "clinical trial, phase ii" in pub_type_str or "clinical trial, phase i" in pub_type_str:
                    source_type = "clinical_trial"
                    trust_score = 8.0
                elif "clinical trial" in pub_type_str or "randomized controlled trial" in pub_type_str:
                    source_type = "clinical_trial"
                    trust_score = 8.5
                elif "review" in pub_type_str:
                    source_type = "review"
                    trust_score = 5.0
                elif "case reports" in pub_type_str:
                    source_type = "case_report"
                    trust_score = 3.0
                elif "in vitro" in pub_type_str or "animal" in pub_type_str:
                    source_type = "preclinical"
                    trust_score = 2.0
    
                papers.append({
                    "pmid": pmid,
                    "title": title,
                    "abstract": abstract,
                    "publication_year": int(year) if year.isdigit() else 2024,
                    "authors": authors,
                    "source_type": source_type,
                    "trust_score": trust_score,
                    "publication_types": ", ".join(pub_types),
                    "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
                })
            return papers
                
        except Exception as e:
            print(f"Error fetching abstracts from PubMed (attempt {attempt+1}): {e}")
            time.sleep(1)
            
    return papers
