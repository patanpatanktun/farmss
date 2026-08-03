from clients.openai_client import OpenAIClient
from models.prompt_request import PromptRequest


class PromptService:
    def __init__(self):
        self.client = OpenAIClient()

    async def generate(self, request: PromptRequest) -> dict:
        """
        GPT-4를 활용한 MMS 마케팅 문구 생성
        """
        system_prompt = self._load_system_prompt()
        user_message = self._build_user_message(request)

        response = await self.client.chat_completion(
            system_prompt=system_prompt,
            user_message=user_message,
        )

        generated_text = response.choices[0].message.content

        return {
            "text": generated_text,
            "byteLength": len(generated_text.encode("euc-kr", errors="ignore")),
        }

    def _load_system_prompt(self) -> str:
        try:
            with open("prompts/system_prompt.txt", "r", encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            return (
                "당신은 농업 마케팅 전문가입니다. "
                "고객에게 발송할 MMS 문자 메시지를 작성해주세요. "
                "한국어로 작성하며, 90바이트 이내로 간결하게 작성하세요."
            )

    def _build_user_message(self, request: PromptRequest) -> str:
        return (
            f"상품명: {request.product_name}\n"
            f"대상 고객: {request.target_audience}\n"
            f"톤앤매너: {request.tone}\n"
            f"키워드: {', '.join(request.keywords or [])}\n"
            f"추가 요청사항: {request.additional_info or '없음'}"
        )
