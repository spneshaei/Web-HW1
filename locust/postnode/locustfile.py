import string
import random
import time
from locust import HttpUser, task, between

class HashFinderUser(HttpUser):
        @task
        def findHash(self):
                self.client.post("/node/sha", json={"string":"hello123"})








