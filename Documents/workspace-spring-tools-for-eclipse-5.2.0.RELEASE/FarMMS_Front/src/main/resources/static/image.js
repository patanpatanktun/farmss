/**
 * 이미지 생성, 이미지 관리
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. 요소 가져오기
  const createImageForm = document.getElementById('create-image-form');
  const imageGalleryContainer = document.getElementById('image-gallery');


  // A. 이미지 생성 처리 (createimage.html)
  if (createImageForm) {
    createImageForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const promptInput = document.getElementById('prompt');
      const styleSelect = document.getElementById('style');
      const previewArea = document.getElementById('image-preview-area');

      const prompt = promptInput ? promptInput.value.trim() : '';
      const style = styleSelect ? styleSelect.value : 'default';

      if (!prompt) {
        alert('생성할 이미지 프롬프트를 입력해 주세요.');
        promptInput?.focus();
        return;
      }

      // API 이미지 생성 요청
      const data = await API.post('/images/generate', { prompt, style });

      if (data && data.imageUrl) {
        alert('이미지가 성공적으로 생성되었습니다!');

        // 프리뷰 영역 표시 (HTML 내 #image-preview-area 요소가 있을 경우)
        if (previewArea) {
          previewArea.innerHTML = `
            <div class="generated-image-card">
              <img src="${Utils.escapeHtml(data.imageUrl)}" alt="생성된 이미지" style="max-width: 100%; height: auto;" />
              <div class="action-buttons" style="margin-top: 10px;">
                <button type="button" onclick="ImageManager.useForMms('${data.imageId}', '${Utils.escapeHtml(data.imageUrl)}')">
                  이 이미지로 MMS 발송하기
                </button>
              </div>
            </div>
          `;
        }
      }
    });
  }


  // B. 이미지 갤러리 로드 및 관리 (manageimage.html)
  if (imageGalleryContainer) {
    ImageManager.loadGallery();
  }
});

// 이미지 관련 공통 객체
const ImageManager = {
  // 갤러리 리스트 불러오기
  async loadGallery() {
    const container = document.getElementById('image-gallery');
    if (!container) return;

    const images = await API.get('/images/my-list');

    if (!images || images.length === 0) {
      container.innerHTML = '<p class="empty-msg">생성된 이미지가 없습니다.</p>';
      return;
    }

    // 갤러리 HTML 렌더링
    container.innerHTML = images.map(img => `
      <div class="image-card" data-id="${img.id}">
        <img src="${Utils.escapeHtml(img.imageUrl)}" alt="저장된 이미지" />
        <div class="image-info">
          <p class="prompt-text">${Utils.escapeHtml(img.prompt)}</p>
          <span class="date">${Utils.formatDate(img.createdAt)}</span>
        </div>
        <div class="card-buttons">
          <button onclick="ImageManager.useForMms('${img.id}', '${Utils.escapeHtml(img.imageUrl)}')">MMS 발송</button>
          <button onclick="ImageManager.deleteImage('${img.id}')" class="btn-delete">삭제</button>
        </div>
      </div>
    `).join('');
  },

  // 이미지 삭제
  async deleteImage(imageId) {
    if (!confirm('이 이미지를 삭제하시겠습니까?')) return;

    const result = await API.delete(`/images/${imageId}`);
    if (result) {
      alert('이미지가 삭제되었습니다.');
      this.loadGallery(); // 리스트 갱신
    }
  },

  // 선택한 이미지를 가지고 MMS 작성 페이지(sendmms.html)로 이동
  useForMms(imageId, imageUrl) {
    // SessionStorage 등에 선택된 이미지 정보 저장 후 이동
    sessionStorage.setItem('selectedImage', JSON.stringify({ id: imageId, url: imageUrl }));
    window.location.href = 'sendmms.html';
  }
};