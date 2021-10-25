import string
import random
import time
from locust import HttpUser, task, between

class AllActionsUser(HttpUser):
        @task
        def findString_Node(self):
                self.client.get(f"/node/sha?sha256=27cc6994fc1c01ce6659c6bddca9b69c4c6a9418065e612c69d110b3f7b11f8a", name="/node/sha")
        
        @task
        def findString_Go(self):
                self.client.get(f"/go/sha?sha256=27cc6994fc1c01ce6659c6bddca9b69c4c6a9418065e612c69d110b3f7b11f8a", name="/go/sha")
        
        @task
        def findHash_Go(self):
                self.client.post("/go/sha", json={"string":"hello123"})

        @task
        def findHash_Node(self):
                self.client.post("/node/sha", json={"string":"hello123"})





