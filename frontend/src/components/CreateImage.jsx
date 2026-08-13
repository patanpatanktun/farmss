import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api';
import Header from './Header';

const PROMPT_EXAMPLES = [
  '비료 포대가 논밭에 놓여 있고 상품명이 매우 크게 보이도록 만들어 주세요.',
  '정부 보조금 지원 문구가 잘 보이도록 밝은 배경으로 만들어 주세요.',
  '상품 가격이 한눈에 들어오는 깔끔한 농자재 홍보 포스터로 만들어 주세요.',
];

export default function CreateImage() {
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);

  const [
    selectedContactNum,
    setSelectedContactNum,
  ] = useState('');

  const [
    selectedProductNum,
    setSelectedProductNum,
  ] = useState('');

  const [promptText, setPromptText] =
    useState('');

  const [generatedImage, setGeneratedImage] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  const [successMessage, setSuccessMessage] =
    useState('');

  /**
   * 고객과 상품 목록을 조회합니다.
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const [contactData, productData] =
        await Promise.all([
          api.get('/contacts'),
          api.get('/products'),
        ]);

      const loadedContacts = Array.isArray(
        contactData
      )
        ? contactData
        : [];

      const loadedProducts = Array.isArray(
        productData
      )
        ? productData
        : [];

      setContacts(loadedContacts);
      setProducts(loadedProducts);

      if (loadedContacts.length > 0) {
        setSelectedContactNum(
          String(loadedContacts[0].conNum)
        );
      }

      if (loadedProducts.length > 0) {
        setSelectedProductNum(
          String(loadedProducts[0].proNum)
        );
      }
    } catch (error) {
      setErrorMessage(
        error.message ||
          '이미지 생성 정보를 불러오지 못했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * 현재 선택한 고객입니다.
   */
  const selectedContact = useMemo(
    () =>
      contacts.find(
        (contact) =>
          Number(contact.conNum) ===
          Number(selectedContactNum)
      ) || null,
    [contacts, selectedContactNum]
  );

  /**
   * 현재 선택한 상품입니다.
   */
  const selectedProduct = useMemo(
    () =>
      products.find(
        (product) =>
          Number(product.proNum) ===
          Number(selectedProductNum)
      ) || null,
    [products, selectedProductNum]
  );

  /**
   * 고객과 상품 정보를 사용해
   * AI 이미지 생성용 프롬프트를 만듭니다.
   */
  const createFinalPrompt = () => {
    if (!selectedProduct) {
      return '';
    }

    const promptParts = [
      '농자재 판매 홍보용 정사각형 포스터를 만들어 주세요.',
      `상품명: ${selectedProduct.proName}`,
      `상품 분류: ${selectedProduct.category}`,
      `가격: ${Number(
        selectedProduct.price
      ).toLocaleString('ko-KR')}원`,
      `제조사: ${selectedProduct.company}`,
    ];

    if (selectedProduct.proDescription) {
      promptParts.push(
        `상품 특징: ${selectedProduct.proDescription}`
      );
    }

    if (selectedProduct.referenceImageUrl) {
      promptParts.push(
        '등록된 상품 참고 이미지의 제품 형태와 포장 디자인을 참고해주세요.'
      );
    }

    if (selectedContact) {
      if (selectedContact.region) {
        promptParts.push(
          `주요 홍보 지역: ${selectedContact.region}`
        );
      }

      if (selectedContact.crop) {
        promptParts.push(
          `주요 재배작물: ${selectedContact.crop}`
        );
      }
    }

    promptParts.push(
      '상품명과 가격이 크고 선명하게 보이도록 해주세요.'
    );

    promptParts.push(
      '농업인이 쉽게 알아볼 수 있도록 복잡하지 않고 가독성 높은 디자인으로 만들어 주세요.'
    );

    if (promptText.trim()) {
      promptParts.push(
        `추가 요청사항: ${promptText.trim()}`
      );
    }

    return promptParts.join('\n');
  };

  /**
   * 홍보 이미지를 생성합니다.
   */
  const handleGenerateImage = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setGeneratedImage(null);

    if (!selectedContactNum) {
      setErrorMessage(
        '홍보 대상 고객을 선택해주세요.'
      );
      return;
    }

    if (!selectedProductNum) {
      setErrorMessage(
        '이미지를 만들 상품을 선택해주세요.'
      );
      return;
    }

    const finalPrompt = createFinalPrompt();

    if (!finalPrompt) {
      setErrorMessage(
        '이미지 생성 프롬프트를 만들 수 없습니다.'
      );
      return;
    }

    setIsGenerating(true);

    try {
      const data = await api.post('/images', {
        conNum: Number(selectedContactNum),
        proNum: Number(selectedProductNum),
        promptText: finalPrompt,
      });

      setGeneratedImage(data);

      setSuccessMessage(
        '홍보 이미지가 생성되었습니다.'
      );
    } catch (error) {
      setErrorMessage(
        error.message ||
          '이미지 생성 중 오류가 발생했습니다.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-100 text-gray-900 min-h-screen flex flex-col justify-between font-sans antialiased">
      <Header />

      <main className="max-w-[1360px] mx-auto px-6 sm:px-10 py-10 w-full flex-1 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            AI 홍보 이미지 만들기
          </h1>

          <p className="text-gray-700 font-bold mt-2">
            고객과 등록된 상품을 선택하면 AI가
            맞춤형 홍보 이미지를 만들어 드립니다.
          </p>
        </div>

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

        {isLoading ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-14 text-center text-gray-500 font-bold shadow-md">
            고객과 상품 정보를 불러오는 중입니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-md space-y-5">
                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    1. 홍보 대상 고객 선택
                  </h2>

                  <p className="text-sm text-gray-600 font-bold mt-1">
                    고객의 지역과 재배작물을 이미지
                    생성 내용에 반영합니다.
                  </p>
                </div>

                {contacts.length === 0 ? (
                  <EmptyDataBox
                    message="등록된 고객이 없습니다."
                    link="/contact"
                    linkText="고객 등록하러 가기"
                  />
                ) : (
                  <>
                    <select
                      value={selectedContactNum}
                      onChange={(event) => {
                        setSelectedContactNum(
                          event.target.value
                        );

                        setGeneratedImage(null);
                        setSuccessMessage('');
                      }}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl font-bold focus:outline-none focus:border-emerald-700 bg-white"
                    >
                      {contacts.map((contact) => (
                        <option
                          key={contact.conNum}
                          value={contact.conNum}
                        >
                          {contact.conName} ·{' '}
                          {contact.region ||
                            '지역 미등록'}{' '}
                          ·{' '}
                          {contact.crop ||
                            '작물 미등록'}
                        </option>
                      ))}
                    </select>

                    {selectedContact && (
                      <div className="rounded-2xl bg-slate-50 border border-gray-200 p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <InfoItem
                            label="고객명"
                            value={
                              selectedContact.conName
                            }
                          />

                          <InfoItem
                            label="전화번호"
                            value={formatPhone(
                              selectedContact.phone
                            )}
                          />

                          <InfoItem
                            label="재배 지역"
                            value={
                              selectedContact.region ||
                              '미등록'
                            }
                          />

                          <InfoItem
                            label="재배작물"
                            value={
                              selectedContact.crop ||
                              '미등록'
                            }
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </section>

              <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-md space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-gray-900">
                      2. 홍보 상품 선택
                    </h2>

                    <p className="text-sm text-gray-600 font-bold mt-1">
                      상품 관리에서 등록한 상품을
                      선택해주세요.
                    </p>
                  </div>

                  <Link
                    to="/product"
                    className="px-4 py-2.5 border-2 border-emerald-700 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-black text-center whitespace-nowrap"
                  >
                    상품 관리
                  </Link>
                </div>

                {products.length === 0 ? (
                  <EmptyDataBox
                    message="등록된 상품이 없습니다."
                    link="/product"
                    linkText="상품 등록하러 가기"
                  />
                ) : (
                  <>
                    <select
                      value={selectedProductNum}
                      onChange={(event) => {
                        setSelectedProductNum(
                          event.target.value
                        );

                        setGeneratedImage(null);
                        setSuccessMessage('');
                      }}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl font-bold focus:outline-none focus:border-emerald-700 bg-white"
                    >
                      {products.map((product) => (
                        <option
                          key={product.proNum}
                          value={product.proNum}
                        >
                          {product.proName} ·{' '}
                          {Number(
                            product.price
                          ).toLocaleString(
                            'ko-KR'
                          )}
                          원
                        </option>
                      ))}
                    </select>

                    {selectedProduct && (
                      <div className="rounded-2xl bg-slate-50 border border-gray-200 overflow-hidden">
                        <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr]">
                          <div className="bg-white border-b sm:border-b-0 sm:border-r border-gray-200 min-h-48">
                            {selectedProduct.referenceImageUrl ? (
                              <img
                                src={
                                  selectedProduct.referenceImageUrl
                                }
                                alt={`${selectedProduct.proName} 참고 이미지`}
                                className="w-full h-52 sm:h-full object-contain p-3"
                              />
                            ) : (
                              <div className="w-full h-48 flex flex-col items-center justify-center text-center text-gray-400 font-bold text-sm p-5">
                                <span>
                                  등록된 참고 이미지가
                                  없습니다.
                                </span>

                                <Link
                                  to="/product"
                                  className="mt-3 text-emerald-700 text-xs font-black hover:underline"
                                >
                                  참고 이미지 등록하기
                                </Link>
                              </div>
                            )}
                          </div>

                          <div className="p-5 space-y-3">
                            <div>
                              <p className="text-xs font-black text-gray-500">
                                상품명
                              </p>

                              <p className="text-lg font-black text-gray-900 mt-1">
                                {
                                  selectedProduct.proName
                                }
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-black">
                                {
                                  selectedProduct.category
                                }
                              </span>

                              <span className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-black">
                                {
                                  selectedProduct.company
                                }
                              </span>
                            </div>

                            <p className="text-2xl font-black text-emerald-700">
                              {Number(
                                selectedProduct.price
                              ).toLocaleString(
                                'ko-KR'
                              )}
                              원
                            </p>

                            <p className="text-sm font-bold text-gray-700 leading-relaxed">
                              {selectedProduct.proDescription ||
                                '등록된 상품 설명이 없습니다.'}
                            </p>

                            {selectedProduct.referenceImageUrl && (
                              <p className="text-xs font-black text-emerald-700">
                                참고 이미지 등록 완료
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </section>

              <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-md space-y-5">
                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    3. 추가 요청사항
                  </h2>

                  <p className="text-sm text-gray-600 font-bold mt-1">
                    원하는 색상, 분위기와 강조 문구를
                    입력해주세요.
                  </p>
                </div>

                <div className="space-y-3">
                  {PROMPT_EXAMPLES.map(
                    (example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() =>
                          setPromptText(example)
                        }
                        className="w-full p-4 bg-slate-50 border-2 border-gray-200 rounded-2xl text-left text-sm font-bold text-gray-800 hover:border-emerald-700 transition"
                      >
                        {example}
                      </button>
                    )
                  )}
                </div>

                <div className="relative">
                  <textarea
                    value={promptText}
                    onChange={(event) =>
                      setPromptText(
                        event.target.value
                      )
                    }
                    rows="7"
                    maxLength={3000}
                    placeholder="추가 요청사항을 입력하세요. 입력하지 않아도 상품과 고객 정보로 기본 프롬프트가 생성됩니다."
                    className="w-full px-4 py-3.5 pb-8 border-2 border-gray-200 rounded-2xl font-bold text-sm resize-none focus:outline-none focus:border-emerald-700"
                  />

                  <span className="absolute right-4 bottom-3 text-xs font-bold text-gray-500">
                    {promptText.length} / 3,000자
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={
                    isGenerating ||
                    contacts.length === 0 ||
                    products.length === 0
                  }
                  className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl shadow-md transition"
                >
                  {isGenerating
                    ? 'AI 이미지 생성 중...'
                    : 'AI 이미지 생성하기'}
                </button>
              </section>
            </div>

            <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-md space-y-6 lg:sticky lg:top-40">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  생성 결과
                </h2>

                <p className="text-sm text-gray-600 font-bold mt-1">
                  생성된 홍보 이미지를 확인할 수
                  있습니다.
                </p>
              </div>

              {selectedProduct?.referenceImageUrl && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-black text-emerald-800 mb-3">
                    선택한 상품 참고 이미지
                  </p>

                  <img
                    src={
                      selectedProduct.referenceImageUrl
                    }
                    alt="선택 상품 참고 이미지"
                    className="w-full max-h-52 object-contain rounded-xl bg-white border border-emerald-100"
                  />
                </div>
              )}

              {isGenerating ? (
                <div className="aspect-square rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-700 animate-spin" />

                  <p className="mt-5 font-black text-emerald-800">
                    이미지를 만들고 있습니다.
                  </p>

                  <p className="mt-2 text-sm font-bold text-gray-600">
                    잠시만 기다려주세요.
                  </p>
                </div>
              ) : generatedImage ? (
                <div className="space-y-5">
                  <div className="aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-slate-50">
                    <img
                      src={generatedImage.imageUrl}
                      alt="생성된 농자재 홍보 이미지"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 border border-gray-200 p-4">
                      <p className="text-xs font-bold text-gray-500">
                        이미지 번호
                      </p>

                      <p className="font-black mt-1">
                        {generatedImage.imageId}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 border border-gray-200 p-4">
                      <p className="text-xs font-bold text-gray-500">
                        다운로드 수
                      </p>

                      <p className="font-black mt-1">
                        {generatedImage.download ??
                          0}
                        회
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/manageimage"
                    className="block w-full py-3.5 text-center border-2 border-emerald-700 text-emerald-700 hover:bg-emerald-50 rounded-2xl font-black"
                  >
                    이미지 관리에서 확인하기
                  </Link>
                </div>
              ) : (
                <div className="aspect-square rounded-2xl bg-slate-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-8">
                  <p className="font-black text-gray-700">
                    아직 생성된 이미지가 없습니다.
                  </p>

                  <p className="mt-2 text-sm font-bold text-gray-500">
                    고객과 상품을 선택한 후 이미지를
                    생성해주세요.
                  </p>
                </div>
              )}


            </section>
          </div>
        )}
      </main>

      <footer className="w-full bg-white border-t border-gray-200 py-6 text-center text-gray-600 text-xs mt-12">
        <p className="font-bold">
          © 2026 FarMMS. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-black text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-black text-gray-900">
        {value}
      </p>
    </div>
  );
}

function EmptyDataBox({
  message,
  link,
  linkText,
}) {
  return (
    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 text-sm font-bold text-amber-800">
      <p>{message}</p>

      <Link
        to={link}
        className="inline-block mt-3 text-emerald-700 font-black hover:underline"
      >
        {linkText} →
      </Link>
    </div>
  );
}

function formatPhone(phone) {
  if (!phone) {
    return '-';
  }

  const numbers = phone.replace(/[^0-9]/g, '');

  if (numbers.length === 11) {
    return numbers.replace(
      /(\d{3})(\d{4})(\d{4})/,
      '$1-$2-$3'
    );
  }

  if (numbers.length === 10) {
    return numbers.replace(
      /(\d{3})(\d{3})(\d{4})/,
      '$1-$2-$3'
    );
  }

  return phone;
}