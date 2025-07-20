from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Union

class App(BaseModel):
    app_name: str
    url: Optional[Union[str, List[str]]] = ""

class Profile(BaseModel):
    id: Optional[str] = None
    user_email: str
    name: str
    color: str = "#6a49ff"
    emoji: str = ""
    date_created: datetime = Field(default_factory=datetime.utcnow)
    last_used: datetime = Field(default_factory=datetime.utcnow)
    apps: List[App] = [] 