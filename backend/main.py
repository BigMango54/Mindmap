import os
import re
import markdown # 把Markdown轉換成HTML
import opencc # 簡體轉繁體
import threading #使用多執行續跑，加快速度
import pytube as pt #抓取YouTube連結
import whisper_timestamped as whisper #語音轉文字，還能生成時間點
import uuid #用來生成每次對話的唯一碼
import pytesseract #用來調用OCR使用，圖像中提取文字
from PIL import Image #用來開啟圖片(JPG)
from pdf2image import convert_from_path #將PDF轉換為圖像，再透過OCR在圖像中提取文字，這裡用來處理手寫檔案。
from tenacity import(retry,wait_random_exponential) #如果函式失敗，會重新再自動重試
from langchain_openai import OpenAIEmbeddings
from langchain_openai import ChatOpenAI
from langchain_community.vectorstores import FAISS 
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter #把文本做分塊，作為輸入
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.history_aware_retriever import create_history_aware_retriever
from langchain.chains.retrieval import create_retrieval_chain
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory

from pytube.innertube import _default_clients
from pytube.exceptions import RegexMatchError
from pytube import cipher

cc = opencc.OpenCC('s2twp')
DEFINITION_THREAD = [] #不知道用途
STORE_DEFINITION = [] #不知道用途
ANS = [] #不知道用途
STORE = [] #存儲對話歷史，session_id 作為鍵，將每個會話的對話歷史存儲起來

os.environ['KMP_DUPLICATE_LIB_OK']='True' # 目前不知道用途
_default_clients["ANDROID"]["context"]["client"]["clientVersion"] = "19.08.35"
_default_clients["IOS"]["context"]["client"]["clientVersion"] = "19.08.35"
_default_clients["ANDROID_EMBED"]["context"]["client"]["clientVersion"] = "19.08.35"
_default_clients["IOS_EMBED"]["context"]["client"]["clientVersion"] = "19.08.35"
_default_clients["IOS_MUSIC"]["context"]["client"]["clientVersion"] = "6.41"
_default_clients["ANDROID_MUSIC"] = _default_clients["ANDROID_CREATOR"]

def get_throttling_function_name(js: str) -> str:
    """Extract the name of the function that computes the throttling parameter.

    :param str js:
        The contents of the base.js asset file.
    :rtype: str
    :returns:
        The name of the function used to compute the throttling parameter.
    """
    function_patterns = [
        r'a\.[a-zA-Z]\s*&&\s*\([a-z]\s*=\s*a\.get\("n"\)\)\s*&&\s*'
        r'\([a-z]\s*=\s*([a-zA-Z0-9$]+)(\[\d+\])?\([a-z]\)',
        r'\([a-z]\s*=\s*([a-zA-Z0-9$]+)(\[\d+\])\([a-z]\)',
    ]
    for pattern in function_patterns:
        regex = re.compile(pattern)
        function_match = regex.search(js)
        if function_match:
            if len(function_match.groups()) == 1:
                return function_match.group(1)
            idx = function_match.group(2)
            if idx:
                idx = idx.strip("[]")
                array = re.search(
                    r'var {nfunc}\s*=\s*(\[.+?\]);'.format(
                        nfunc=re.escape(function_match.group(1))),
                    js
                )
                if array:
                    array = array.group(1).strip("[]").split(",")
                    array = [x.strip() for x in array]
                    return array[int(idx)]

    raise RegexMatchError(
        caller="get_throttling_function_name", pattern="multiple"
    )

cipher.get_throttling_function_name = get_throttling_function_name



class Node:
    def __init__(self, name):
        self.name = name
        self.mark = ""
        self.child = None
        self.sibling = None

class LinkedList:
    def __init__(self):
        self.head = None
    
    def insertTitle(self, title):
        node = Node(title)
        node.mark = "#"
        self.head = node
        return node
    
    def insertNode(self, parent, nodes, conversational_rag_chain, session_id):
        if parent.child is not None : #檢查父節點是否已經有子節點了，有->返回
            return
        former_node = None
        for n in nodes:
            node = Node(n)
            node.mark = parent.mark + "#" #第二層Markdown
            DEFINITION_THREAD.append(threading.Thread(target = _store_def, args = (conversational_rag_chain, node.name, session_id)))
            if parent.child is None:
                parent.child = node
            if former_node is None:
                former_node = node
            else:
                former_node.sibling = node
                former_node = node
            # 106 - 113 看不太懂
    # 116 - 137 不懂
    def searchParent(self, name):
        current_node = self.head
        start = -1
        end = -1
        queue = []
        while(current_node):
            if current_node.name == name:
                return current_node
            if current_node.sibling is not None:
                if current_node.child is not None:
                    if start < 0:
                        start += 1
                    end += 1
                    queue.append(current_node.child)
                current_node = current_node.sibling
            else:
                if current_node == self.head:
                    current_node = current_node.child
                elif end >= start:
                    current_node = queue[start]
                    start += 1
                else:
                    break
        return None
    
    def printLL(self, knowledge_base_forTSP):
        global TSP
        current_node = self.head
        top = -1
        stack = []
        while(current_node):
            if knowledge_base_forTSP:
                docs = knowledge_base_forTSP.similarity_search(current_node.name)
                print(docs)
                ANS.append(current_node.mark + " " + current_node.name + " " + str(TSP[docs[0].page_content]) + "\n")
            else:
                ANS.append(current_node.mark + " " + current_node.name + "\n")

            if current_node.name != self.head.name:
                if current_node.name in STORE_DEFINITION:
                    ANS.append(STORE_DEFINITION[current_node.name] + "\n")
                else:
                    ANS.append("Definition is not found.\n")
            
            if current_node.child is not None:
                if current_node.sibling is not None:
                    top += 1
                    stack.append(current_node.sibling)
            elif current_node.sibling is not None:
                current_node = current_node.sibling
            else:
                if top >= 0:
                    current_node = stack[top]
                    top -= 1
                    stack.pop()
                else:
                    break 


# 用LangChain的Prompt Template，CONDENSE_PROMPT = 用來將問題重術，讓她變成是一個問題，不依賴以前的對話紀錄    
CONDENSE_PROMPT = """Given a chat history and the latest user question \
which might reference context in the chat history, formulate a standalone question \
which can be understood without the chat history. Do NOT answer the question, \
just reformulate it if needed and otherwise return it as is.
"""
# QA_PROMPT = 只根據檢索回來的相關信息來回答問題，沒有答案則回答不知道
QA_PROMPT = """You are an assistant for question-answering tasks. \
Use the following pieces of retrieved context to answer the question. \
If you don't know the answer, just say that you don't know. \
Use three sentences maximum and keep the answer concise.\

{context}
"""

# 根據 session_id 來檢索或創建一個與特定會話相關的對話歷史
def _get_memory(session_id=None) -> BaseChatMessageHistory:
    if session_id is None:
        session_id = str(uuid.uuid4())
    if session_id not in STORE:
        STORE[session_id] = ChatMessageHistory()


# 目前不知道_store_def是做啥的
def _store_def(conversational_rag_chain, node, session_id):
    # print("====== conversation pass 1 ======")
    response_1 = conversational_rag_chain.invoke(
        input={"input": node + "的說明"},
        config={
            "configurable": {"session_id": session_id}
        }
    )
    STORE_DEFINITION[node] = response_1["answer"]

def get_chat_llm():
    return ChatOpenAI(model="gpt-3.5-turbo", temperature=0.0001)

#她是寫PDF TO TEXT，但我看不懂，page_content是啥我也不太去訂
def format_docs(pages):
    return "\n\n".join([p.page_content for p in pages])

#分塊
def toChunk(text):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100, # 每兩段之間會有100個字符的重疊部分
        length_function=len,
    )
    return text_splitter.split_text(text)

#PDF
def _get_pdf_retriever(pdf):
    loader = PyPDFLoader(pdf)
    pages = loader.load_and_split()
    text = format_docs(pages)
    chunks = toChunk(text)
    embeddings = OpenAIEmbeddings()
    knowledge_base = FAISS.from_texts(chunks, embeddings)
    retriever  = knowledge_base.as_retriever(
        search_kwargs={"k": 3}
    )
    return retriever

#MP3
def _get_mp3_retriever(mp3):
    model = whisper.load_model("base")
    result = model.transcribe(mp3)
    text = result["text"]
    text = cc.convert(text)
    chunks = toChunk(text)
    embeddings = OpenAIEmbeddings()
    knowledge_base = FAISS.from_texts(chunks, embeddings)
    retriever = knowledge_base.as_retriever(
        search_kwargs={"k": 3}
    )
    return retriever, result

#圖片做OCR
def _get_picture_retriever(picture):
    img = Image.open(picture)
    result = pytesseract.image_to_string(img, lang='chi_tra')
    text = result
    text = cc.convert(text)
    chunks = toChunk(text)
    embeddings = OpenAIEmbeddings()
    knowledge_base = FAISS.from_texts(chunks, embeddings)
    retriever = knowledge_base.as_retriever(
        search_kwargs={"k": 3}
    )
    return retriever

#手寫筆記?
def _get_write_retriever(write):
    pages = convert_from_path(write, 600)
    text_data = ''
    for page in pages:
        text = pytesseract.image_to_string(page, lang='chi_tra')
        text_data += text + '\n'
    text = cc.convert(text_data)
    chunks = toChunk(text)
    embeddings = OpenAIEmbeddings()
    knowledge_base = FAISS.from_texts(chunks, embeddings)
    retriever = knowledge_base.as_retriever(
        search_kwargs={"k": 3}
    )
    return retriever

def _get_yt_retriever(ytLink):
    print("下載中!")
    yt = pt.YouTube(ytLink)
    stream = yt.streams.filter(only_audio=True)[0]
    stream.download(filename="yu_audio_np3")
    model = whisper.load_model("base")
    result = model.transcribe("yt_audio.mp3")
    text = result["text"]
    text = cc.convert(text)
    chunks = toChunk(text)
    embeddings = OpenAIEmbeddings()
    knowledge_base = FAISS.from_texts(chunks, embeddings)
    retriever = knowledge_base.as_retriever(
        search_kwargs={"k": 3}
    )
    return retriever, result

def init_node(llist, conversational_rag_chain, title, session_id):
    global front, reer
    response_1 = conversational_rag_chain.invoke(
        input={"input": "摘要最重要的4~8個重點"},
        config={
            "configurable": {"session_id": session_id}
        }
    )
    print(cc.convert(response_1["answer"]))
    
    response_2 = conversational_rag_chain.invoke(
        input={"input": "條列式摘要其4~8個重點名詞作為標題"},
        config={
            "configurable": {"session_id": session_id}
        }
    )
    print(cc.convert(response_2["answer"]))

    mkresponse = markdown.markdown(response_2['answer'])
    
    #加標題
    parent = llist.insertTitle(title)
    split = mkresponse.split("\n")
    #這裡建立執行緒寫法先寫她的，建立x個子執行緒
    nodes = []
    x = 0
    for s in split:
        if s[1] == "l":
            x+=1
            print("node " + str(x) + ":" + s[4:len(s)-5])
            nodes.append(s[4:len(s)-5])
            WORK.append(s[4:len(s)-5])
            WORK_THREAD.append(threading.Thread(target = gen_node, args = (llist, conversational_rag_chain, WORK[len(WORK)-1], session_id)))
            if front < 0:
                front += 1
            reer += 1
    # print(nodes)
    llist.insertNode(parent, nodes, conversational_rag_chain, session_id)

@retry(wait=wait_random_exponential(multiplier=1, max=10))
def gen_node(llist, conversational_rag_chain, name, session_id):
    global front, reer
    response_1 = conversational_rag_chain.invoke(
        input={"input": "摘要關於\"\"\"" + name + "\"\"\"內容中最重要的3~5個重點"},
        config={
            "configurable": {"session_id": session_id}
        }
    )
    print(cc.convert(response_1["answer"]))

    response_2 = conversational_rag_chain.invoke(
        input={"input": "條列式摘要以上3~5個重點名詞作為標題，但不包含\"\"\"" + name + "\"\"\"與之前所摘要過的重點名詞"},
        config={
            "configurable": {"session_id": session_id}
        }
    )
    print(cc.convert(response_2["answer"]))
    mkrespome = markdown.markdown(response_2["answer"])
    
    #這?
    parent = llist.searchParent(name)
    split = mkrespome.split("\n")
    nodes = []
    for s in split:
        if s.startswith("<li>"):
            node_name = s[4:len(s)-5]
            nodes.append(node_name)
            WORK.append(node_name)
            WORK_THREAD.append(threading.Thread(target = gen_node, args = (llist, conversational_rag_chain, node_name, session_id)))
            reer += 1
    llist.insertNode(parent, nodes, conversational_rag_chain, session_id)


#初始化
def _clear_state():
    global STORE, STORE_DEFINITION, ANS, WORK, WORK_THREAD, DEFINITION_THREAD, STACK, front, reer, TSP
    STORE = dict()
    STORE_DEFINITION = dict()
    STACK = []
    ANS = []
    WORK = []
    WORK_THREAD = []
    DEFINITION_THREAD = []
    front = -1
    reer = -1   
    TSP = dict()

def generate(source, filename):
    global front, reer, WORK_THREAD, TSP
    _clear_state() #清除上次運行的狀態
    session_id = str(uuid.uuid4())  # 每次運行生成一個新的 session_id
    result = None
    knowledge_base_forTSP = None
    # OCR 寫法?
    if source.split(".")[0] == 'OCR':
        retriever = _get_write_retriever(source[4:])
    elif source.split(".")[1] == 'pdf':
        retriever = _get_pdf_retriever(source)
    elif source.split(".")[1] == 'mp3':
         retriever, result = _get_mp3_retriever(source)
    elif source.split(".")[1] == 'jpg' or source.split(".")[1] == 'png':
        retriever = _get_picture_retriever(source)
    else:
         retriever, result = _get_yt_retriever(source)


#新加的部分，用來記錄yt影片時間點
    if result != None:
        print(len(result["segments"]))
        chunks = []
        for s in result["segments"]:
            chunks.append(s["text"])
            TSP[s["text"]] = s["start"]
        print(len(chunks))
        print(type(TSP))
        print(len(TSP))
        embeddings = OpenAIEmbeddings()
        knowledge_base_forTSP = FAISS.from_texts(chunks, embeddings)


    llm = get_chat_llm()       

    condense_prompt = ChatPromptTemplate.from_messages([
        ("system", CONDENSE_PROMPT),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}")  
    ])

    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", QA_PROMPT),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}")
    ])

    history_aware_retriever = create_history_aware_retriever(
        llm, retriever, condense_prompt
    )

    question_answer_chain = create_stuff_documents_chain(
        llm, qa_prompt
    )
    rag_chain = create_retrieval_chain(
        history_aware_retriever,
        question_answer_chain
    )

    conversational_rag_chain = RunnableWithMessageHistory(
        rag_chain,
        _get_memory,
        input_messages_key="input",
        history_messages_key="chat_history",
        output_messages_key="answer",
        config={"configurable": {"session_id": session_id}}  # 傳入新的 session_id
    )
 
    llist = LinkedList()
    
    init_node(llist, conversational_rag_chain, filename, session_id)
    level = 3
    while level != 2 or front > reer:
        start = front
        end = reer
        fix = 16
        cur_start = start
        cur_stop = cur_start + fix
        while 1:
            if cur_start >= end + 1:
                break
            if cur_stop > end + 1:
                cur_stop = end + 1
            for i in range(cur_start, cur_stop):
                WORK_THREAD[i].start()
                front += 1
            for i in range(cur_start, cur_stop):
                WORK_THREAD[i].join()
            cur_start = cur_stop
            cur_stop = cur_start + fix
        level -= 1
    for i in range(len(DEFINITION_THREAD)):
        DEFINITION_THREAD[i].start()
    for i in range(len(DEFINITION_THREAD)):
        DEFINITION_THREAD[i].join()
    
    print("\n" + str(len(STORE_DEFINITION)))
    print(STORE_DEFINITION)

    llist.printLL(knowledge_base_forTSP) 

    print("\nfront:" + str(front))
    print("reer:" + str(reer))
    print("\nmarkdown:\n")
    for a in ANS:
        print(a)
    return "\n".join(ANS)