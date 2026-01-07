from xrpl.clients import JsonRpcClient
import os
import threading
from dotenv import load_dotenv

load_dotenv()

class XRPLClient:
    _instance = None
    _lock = threading.Lock()
    _client = None
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    @property
    def client(self):
        if self._client is None:
            with self._lock:
                if self._client is None:
                    network = os.getenv("XRPL_NETWORK", "testnet")
                    url = "https://xrplcluster.com/" if network == "mainnet" else "https://s.altnet.rippletest.net:51234/"
                    self._client = JsonRpcClient(url)
        return self._client
