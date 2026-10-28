from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import KnowledgeBase, User
from app.schemas.schemas import KnowledgeBaseCreate, KnowledgeBaseResponse
from app.auth.security import require_role

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base"])

@router.get("", response_model=List[KnowledgeBaseResponse])
def get_knowledge_articles(
    db: Session = Depends(get_db),
    language: Optional[str] = "en",
    category: Optional[str] = None,
    search: Optional[str] = None
):
    """Retrieves regulatory knowledge base articles with full-text search and language filtering."""
    query = db.query(KnowledgeBase)
    
    if language and language != "all":
        query = query.filter(KnowledgeBase.language == language)
        
    if category and category != "all":
        query = query.filter(KnowledgeBase.category.ilike(f"%{category}%"))
        
    if search:
        query = query.filter(
            (KnowledgeBase.title.ilike(f"%{search}%")) |
            (KnowledgeBase.content.ilike(f"%{search}%"))
        )
        
    return query.order_by(KnowledgeBase.created_at.desc()).all()

@router.get("/{article_id}", response_model=KnowledgeBaseResponse)
def get_article_by_id(article_id: int, db: Session = Depends(get_db)):
    article = db.query(KnowledgeBase).filter(KnowledgeBase.id == article_id).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found.")
    return article

@router.post("", response_model=KnowledgeBaseResponse, status_code=status.HTTP_201_CREATED)
def create_article(
    art_in: KnowledgeBaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    """Admin-only: Publish new verified institutional SOP."""
    article = KnowledgeBase(
        title=art_in.title,
        category=art_in.category,
        content=art_in.content,
        language=art_in.language,
        tags=art_in.tags
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return article
