import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api';
import Header from './Header';

export default function ManageImage() {
  const [images, setImages] = useState([]);
  const [products, setProducts] = useState([]);

  const [keyword, setKeyword] = useState('');

  const [
    selectedProductNum,
    setSelectedProductNum,
  ] = useState('');

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [
    downloadingImageId,
    setDownloadingImageId,
  ] = useState(null);

  const [
    deletingImageId,
    setDeletingImageId,
  ] = useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState('');

  const [successMessage, setSuccessMessage] =
    useState('');

  const [regenerateTarget, setRegenerateTarget] =
    useState(null);

  const [editPrompt, setEditPrompt] =
    useState('');

  const [regeneratingImageId, setRegeneratingImageId] =
    useState(null);

  /**
   * 생성된 이미지와 상품 목록을 조회합니다.
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const [imageData, productData] =
        await Promise.all([
          api.get('/images'),
          api.get('/products'),
        ]);

      setImages(
        Array.isArray(imageData)
          ? imageData
          : []
      );

      setProducts(
        Array.isArray(productData)
          ? productData
          : []
      );
    } catch (error) {
      setErrorMessage(
        error.message ||
          '생성된 이미지 목록을 불러오지 못했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * 상품 번호로 상품 정보를 찾습니다.
   */
  const productMap = useMemo(() => {
    const result = new Map();

    products.forEach((product) => {
      result.set(
        Number(product.proNum),
        product
      );
    });

    return result;
  }, [products]);

  /**
   * 상품명과 제조사 및 선택 상품으로 검색합니다.
   */
  const filteredImages = useMemo(() => {
    const normalizedKeyword =
      keyword.trim().toLowerCase();

    return images.filter((image) => {
      const product = productMap.get(
        Number(image.proNum)
      );

      const productName =
        product?.proName || '';

      const company =
        product?.company || '';

      const matchesKeyword =
        !normalizedKeyword ||
        productName
          .toLowerCase()
          .includes(normalizedKeyword) ||
        company
          .toLowerCase()
          .includes(normalizedKeyword);

      const matchesProduct =
        !selectedProductNum ||
        Number(image.proNum) ===
          Number(selectedProductNum);

      return (
        matchesKeyword &&
        matchesProduct
      );
    });
  }, [
    images,
    productMap,
    keyword,
    selectedProductNum,
  ]);

  /**
   * 이미지 다운로드 횟수를 증가시키고
   * 이미지 파일을 엽니다.
   */
  const handleDownload = async (image) => {
    setDownloadingImageId(image.imageId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const data = await api.post(
        `/images/${image.imageId}/download`,
        {}
      );

      if (!data?.imageUrl) {
        throw new Error(
          '다운로드할 이미지 주소가 없습니다.'
        );
      }

      setImages((previousImages) =>
        previousImages.map(
          (previousImage) =>
            previousImage.imageId ===
            image.imageId
              ? {
                  ...previousImage,
                  download:
                    data.download ??
                    previousImage.download,
                }
              : previousImage
        )
      );

      setSelectedImage((previous) => {
        if (
          !previous ||
          previous.imageId !== image.imageId
        ) {
          return previous;
        }

        return {
          ...previous,
          download:
            data.download ??
            previous.download,
        };
      });

      const downloadLink =
        document.createElement('a');

      downloadLink.href = data.imageUrl;

      downloadLink.download =
        `farmms-image-${image.imageId}.png`;

      downloadLink.target = '_blank';
      downloadLink.rel =
        'noopener noreferrer';

      document.body.appendChild(
        downloadLink
      );

      downloadLink.click();
      downloadLink.remove();

      setSuccessMessage(
        '이미지 다운로드를 시작했습니다.'
      );
    } catch (error) {
      setErrorMessage(
        error.message ||
          '이미지 다운로드 중 오류가 발생했습니다.'
      );
    } finally {
      setDownloadingImageId(null);
    }
  };

  /**
   * 생성된 이미지를 삭제합니다.
   */
  const handleDelete = async (image) => {
    const product = productMap.get(
      Number(image.proNum)
    );

    const productName =
      product?.proName || '선택한';

    const confirmed = window.confirm(
      `${productName} 홍보 이미지를 삭제하시겠습니까?\n\n` +
        '삭제된 이미지와 프롬프트 내역은 복구할 수 없습니다.'
    );

    if (!confirmed) {
      return;
    }

    setDeletingImageId(image.imageId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await api.delete(
        `/images/${image.imageId}`
      );

      setImages((previousImages) =>
        previousImages.filter(
          (previousImage) =>
            previousImage.imageId !==
            image.imageId
        )
      );

      if (
        selectedImage?.imageId ===
        image.imageId
      ) {
        setSelectedImage(null);
      }

      setSuccessMessage(
        '생성된 이미지가 삭제되었습니다.'
      );
    } catch (error) {
      setErrorMessage(
        error.message ||
          '이미지 삭제 중 오류가 발생했습니다.'
      );
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleSearchReset = () => {
    setKeyword('');
    setSelectedProductNum('');
  };

  /**
   * 기존 이미지를 사용자의 수정 요청에 맞춰 재생성합니다.
   */
  const handleRegenerate = async () => {
    if (!regenerateTarget) {
      return;
    }

    const normalizedPrompt = editPrompt.trim();

    if (!normalizedPrompt) {
      setErrorMessage('이미지 수정 요청을 입력해주세요.');
      return;
    }

    if (normalizedPrompt.length > 1000) {
      setErrorMessage('이미지 수정 요청은 1,000자 이하로 입력해주세요.');
      return;
    }

    setRegeneratingImageId(regenerateTarget.imageId);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await api.post('/images/regenerate', {
        imageId: Number(regenerateTarget.imageId),
        editPrompt: normalizedPrompt,
      });

      const regeneratedImageId = result?.regeneratedImageId;

      if (!regeneratedImageId) {
        throw new Error('재생성된 이미지 번호를 전달받지 못했습니다.');
      }

      const regeneratedImage = await api.get(
        `/images/${regeneratedImageId}`
      );

      setImages((previousImages) => [
        regeneratedImage,
        ...previousImages.filter(
          (image) => image.imageId !== regeneratedImage.imageId
        ),
      ]);

      setSelectedImage(regeneratedImage);
      setRegenerateTarget(null);
      setEditPrompt('');
      setSuccessMessage(
        result?.message || '이미지가 새롭게 재생성되었습니다.'
      );
    } catch (error) {
      setErrorMessage(
        error.message || '이미지 재생성 중 오류가 발생했습니다.'
      );
    } finally {
      setRegeneratingImageId(null);
    }
  };

  const openRegenerateModal = (image) => {
    setSelectedImage(null);
    setRegenerateTarget(image);
    setEditPrompt('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="bg-slate-100 text-gray-900 min-h-screen flex flex-col justify-between font-sans antialiased">
      <Header />

      <main className="max-w-[1360px] mx-auto px-6 sm:px-10 py-10 w-full flex-1 space-y-8">
        <section className="bg-white rounded-3xl p-8 border border-gray-200 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                이미지 관리
              </h1>

              <p className="text-gray-700 font-bold text-base mt-2">
                생성된 홍보 이미지를 확인하고
                다운로드하거나 삭제할 수 있습니다.
              </p>
            </div>

            <div className="flex items-center gap-2 text-gray-700 font-bold">
              <span>전체</span>

              <span className="text-emerald-700 font-black text-3xl">
                {images.length}
              </span>

              <span>개</span>
            </div>
          </div>
        </section>

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            {successMessage}
          </div>
        )}

        <section className="bg-white rounded-3xl border border-gray-200 p-6 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_260px_auto] gap-3">
            <input
              type="text"
              value={keyword}
              onChange={(event) =>
                setKeyword(event.target.value)
              }
              placeholder="상품명 또는 제조사 검색"
              className="px-4 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-700"
            />

            <select
              value={selectedProductNum}
              onChange={(event) =>
                setSelectedProductNum(
                  event.target.value
                )
              }
              className="px-4 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-black bg-white focus:outline-none focus:border-emerald-700"
            >
              <option value="">
                전체 상품
              </option>

              {products.map((product) => (
                <option
                  key={product.proNum}
                  value={product.proNum}
                >
                  {product.proName}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleSearchReset}
              className="px-6 py-3.5 border-2 border-gray-200 hover:bg-gray-50 rounded-2xl text-sm font-black"
            >
              초기화
            </button>
          </div>
        </section>

        {isLoading ? (
          <div className="bg-white rounded-3xl border border-gray-200 py-20 text-center text-gray-500 font-bold shadow-md">
            생성된 이미지 목록을 불러오는 중입니다.
          </div>
        ) : filteredImages.length === 0 ? (
          <section className="bg-white rounded-3xl border border-gray-200 py-20 px-6 text-center shadow-md">
            <p className="text-xl font-black text-gray-800">
              조회된 이미지가 없습니다.
            </p>

            <p className="text-sm text-gray-500 font-bold mt-2">
              고객과 상품을 선택해서 첫 홍보 이미지를
              만들어보세요.
            </p>

            <Link
              to="/createimage"
              className="inline-block mt-6 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-sm"
            >
              이미지 만들러 가기
            </Link>
          </section>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
            {filteredImages.map((image) => {
              const product = productMap.get(
                Number(image.proNum)
              );

              return (
                <article
                  key={image.imageId}
                  className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden flex flex-col"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImage(image)
                    }
                    className="block w-full bg-emerald-50/50 p-4"
                  >
                    <div className="w-full aspect-square bg-white rounded-2xl border border-emerald-100 overflow-hidden">
                      <img
                        src={image.imageUrl}
                        alt={`${
                          product?.proName ||
                          '농자재'
                        } 홍보 이미지`}
                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                      />
                    </div>
                  </button>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-3 text-xs font-black text-gray-500">
                      <span>
                        {formatDate(
                          image.createDay
                        )}
                      </span>

                      <span>
                        다운로드{' '}
                        {image.download ?? 0}회
                      </span>
                    </div>

                    <h2 className="mt-4 text-xl font-black text-gray-900">
                      {product?.proName ||
                        '확인할 수 없는 상품'}
                    </h2>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {product?.category && (
                        <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-black">
                          {product.category}
                        </span>
                      )}

                      {product?.company && (
                        <span className="px-3 py-1 bg-slate-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-black">
                          {product.company}
                        </span>
                      )}
                    </div>

                    {product && (
                      <p className="mt-4 text-lg font-black text-emerald-700">
                        {Number(
                          product.price
                        ).toLocaleString(
                          'ko-KR'
                        )}
                        원
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-auto pt-6">
                      <button
                        type="button"
                        onClick={() =>
                          handleDownload(image)
                        }
                        disabled={
                          downloadingImageId ===
                          image.imageId
                        }
                        className="py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-400 text-white font-black text-xs rounded-2xl transition"
                      >
                        {downloadingImageId ===
                        image.imageId
                          ? '준비 중'
                          : '저장'}
                      </button>

                      <button
                        type="button"
                        onClick={() => openRegenerateModal(image)}
                        disabled={
                          regeneratingImageId === image.imageId
                        }
                        className="py-3 border-2 border-emerald-700 bg-white hover:bg-emerald-50 disabled:bg-gray-100 text-emerald-700 font-black text-xs rounded-2xl transition"
                      >
                        {regeneratingImageId === image.imageId
                          ? '재생성 중'
                          : '재생성'}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(image)
                        }
                        disabled={
                          deletingImageId ===
                          image.imageId
                        }
                        className="py-3 border-2 border-red-200 bg-white hover:bg-red-50 disabled:bg-gray-100 text-red-600 font-black text-xs rounded-2xl transition"
                      >
                        {deletingImageId ===
                        image.imageId
                          ? '삭제 중'
                          : '삭제'}
                      </button>

                      <Link
                        to="/sendmms"
                        state={{
                          imageId: image.imageId,
                        }}
                        className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-xs rounded-2xl transition text-center"
                      >
                        MMS 발송
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>

      {selectedImage && (
        <ImageDetailModal
          image={selectedImage}
          product={productMap.get(
            Number(selectedImage.proNum)
          )}
          isDownloading={
            downloadingImageId ===
            selectedImage.imageId
          }
          isDeleting={
            deletingImageId ===
            selectedImage.imageId
          }
          onDownload={() =>
            handleDownload(selectedImage)
          }
          onDelete={() =>
            handleDelete(selectedImage)
          }
          onRegenerate={() =>
            openRegenerateModal(selectedImage)
          }
          onClose={() =>
            setSelectedImage(null)
          }
        />
      )}

      {regenerateTarget && (
        <RegenerateImageModal
          image={regenerateTarget}
          product={productMap.get(Number(regenerateTarget.proNum))}
          editPrompt={editPrompt}
          isRegenerating={
            regeneratingImageId === regenerateTarget.imageId
          }
          onPromptChange={setEditPrompt}
          onSubmit={handleRegenerate}
          onClose={() => {
            if (!regeneratingImageId) {
              setRegenerateTarget(null);
              setEditPrompt('');
            }
          }}
        />
      )}

      <footer className="w-full bg-white border-t border-gray-200 py-6 px-10 text-center text-gray-600 text-xs mt-12 shadow-sm">
        <p className="font-bold">
          © 2026 FarMMS. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function ImageDetailModal({
  image,
  product,
  isDownloading,
  isDeleting,
  onDownload,
  onDelete,
  onRegenerate,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 px-4 py-8 flex items-center justify-center"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-4xl max-h-full overflow-y-auto bg-white rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-black text-gray-900">
              {product?.proName ||
                '홍보 이미지 상세보기'}
            </h2>

            <p className="text-xs text-gray-500 font-bold mt-1">
              {formatDate(image.createDay)} 생성
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-black"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 p-6">
          <div className="bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center">
            <img
              src={image.imageUrl}
              alt="생성 이미지 상세보기"
              className="w-full max-h-[650px] object-contain"
            />
          </div>

          <div className="space-y-5">
            <DetailItem
              label="이미지 번호"
              value={image.imageId}
            />

            <DetailItem
              label="상품명"
              value={
                product?.proName ||
                '상품 정보 없음'
              }
            />

            <DetailItem
              label="상품 분류"
              value={product?.category || '-'}
            />

            <DetailItem
              label="제조사"
              value={product?.company || '-'}
            />

            <DetailItem
              label="다운로드"
              value={`${image.download ?? 0}회`}
            />

            <button
              type="button"
              onClick={onDownload}
              disabled={isDownloading}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-400 text-white rounded-2xl font-black"
            >
              {isDownloading
                ? '다운로드 준비 중...'
                : '이미지 저장하기'}
            </button>

            <Link
              to="/sendmms"
              state={{
                imageId: image.imageId,
              }}
              className="block w-full py-3.5 border-2 border-emerald-700 text-emerald-700 hover:bg-emerald-50 rounded-2xl font-black text-center"
            >
              이 이미지로 MMS 발송
            </Link>

            <button
              type="button"
              onClick={onRegenerate}
              className="w-full py-3.5 border-2 border-emerald-700 text-emerald-700 hover:bg-emerald-50 rounded-2xl font-black"
            >
              이 이미지 재생성하기
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="w-full py-3.5 border-2 border-red-200 text-red-600 hover:bg-red-50 disabled:bg-gray-100 rounded-2xl font-black"
            >
              {isDeleting
                ? '이미지 삭제 중...'
                : '이미지 삭제'}
            </button>

            <p className="text-xs text-gray-500 font-bold leading-relaxed">
              MMS 발송 이력이 존재하는 이미지는
              발송 내역 보존을 위해 삭제할 수 없습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegenerateImageModal({
  image,
  product,
  editPrompt,
  isRegenerating,
  onPromptChange,
  onSubmit,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-[110] bg-black/60 px-4 py-8 flex items-center justify-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isRegenerating) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-3xl max-h-full overflow-y-auto bg-white rounded-3xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-black text-gray-900">
              이미지 재생성
            </h2>
            <p className="text-xs text-gray-500 font-bold mt-1">
              기존 이미지는 유지되고 새 이미지가 추가됩니다.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isRegenerating}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 disabled:text-gray-300 text-gray-700 font-black"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 p-6">
          <div>
            <img
              src={image.imageUrl}
              alt="재생성할 기존 이미지"
              className="w-full aspect-square object-cover rounded-2xl border border-gray-200 bg-slate-50"
            />
            <p className="mt-3 text-sm font-black text-gray-900">
              {product?.proName || '상품 정보 없음'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="editPrompt"
                className="block text-sm font-black text-gray-800 mb-2"
              >
                수정 요청사항
              </label>
              <textarea
                id="editPrompt"
                value={editPrompt}
                onChange={(event) => onPromptChange(event.target.value)}
                rows={9}
                maxLength={1000}
                disabled={isRegenerating}
                placeholder="예: 35,000원을 25,000원으로 변경하고 배경을 더 밝게 만들어주세요."
                className="w-full p-4 border-2 border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-700 resize-none disabled:bg-gray-100"
              />
              <p className="mt-2 text-right text-xs font-black text-gray-500">
                {editPrompt.length} / 1,000자
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold text-amber-800 leading-relaxed">
              이미지 생성에는 시간이 걸릴 수 있습니다. 처리 중에는 창을 닫지 마세요.
            </div>

            <button
              type="button"
              onClick={onSubmit}
              disabled={isRegenerating || !editPrompt.trim()}
              className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-2xl font-black"
            >
              {isRegenerating
                ? 'AI 이미지 재생성 중...'
                : 'AI 이미지 재생성하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-gray-200 p-4">
      <p className="text-xs text-gray-500 font-black">
        {label}
      </p>

      <p className="mt-1 font-black text-gray-900">
        {value}
      </p>
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return '생성일 정보 없음';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}