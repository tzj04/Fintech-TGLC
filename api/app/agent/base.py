from abc import ABC, abstractmethod

class BaseAgent(ABC):
    @abstractmethod
    def act(self, *args, **kwargs):
        """Perform the agent's main function."""
        pass
