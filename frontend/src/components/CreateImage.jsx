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
  '농자재의 가치를 높여주는 고급스럽고 신뢰감 있는 분위기로 만들어 주세요.',
  '상품이 한눈에 들어오는 깔끔한 농자재 홍보 포스터로 만들어 주세요.',
  '믿고 쓰는 농자재라는 신뢰감을 최대한 담아주세요.',
];

const ACTIVE_IMAGE_GENERATION_KEY =
  'farmms.activeImageGenerationId';
const IMAGE_POLL_INTERVAL = 2500;

export default function CreateImage() {
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [products, setProducts] = useState([]);

  // targetType: 'contact' 또는 'group'
  const [targetType, setTargetType] = useState('contact');

  const [
    selectedContactNum,
    setSelectedContactNum,
  ] = useState('');

  const [
    selectedGroupNum,
    setSelectedGroupNum,
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

  const [currentImageId, setCurrentImageId] =
    useState(() => {
      const savedImageId = localStorage.getItem(
        ACTIVE_IMAGE_GENERATION_KEY
      );

      if (!savedImageId) {
        return null;
      }

      const parsedImageId = Number(savedImageId);

      return Number.isFinite(parsedImageId)
        ? parsedImageId
        : null;
    });

  const [errorMessage, setErrorMessage] =
    useState('');

  const [successMessage, setSuccessMessage] =
    useState('');

  /**
   * 고객, 그룹, 상품 목록을 조회합니다.
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const [contactData, groupData, productData] =
        await Promise.all([
          api.get('/contacts'),
          api.get('/contact-groups'),
          api.get('/products'),
        ]);

      const loadedContacts = Array.isArray(
        contactData
      )
        ? contactData
        : [];

      const loadedGroups = Array.isArray(
        groupData
      )
        ? groupData
        : [];

      const loadedProducts = Array.isArray(
        productData
      )
        ? productData
        : [];

      setContacts(loadedContacts);
      setGroups(loadedGroups);
      setProducts(loadedProducts);

      if (loadedContacts.length > 0) {
        setSelectedContactNum(
          String(loadedContacts[0].conNum)
        );
      }

      if (loadedGroups.length > 0) {
        setSelectedGroupNum(
          String(loadedGroups[0].groupNum)
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
   * 현재 진행 중인 이미지 생성 작업을 서버에서 조회합니다.
   *
   * CreateImage 페이지가 열려 있는 동안 이 API를 반복 호출하여
   * PENDING / PROCESSING 상태를 화면에 유지하고,
   * COMPLETED가 되면 생성된 이미지를 이 페이지에서 바로 보여줍니다.
   */
  const checkGenerationStatus = useCallback(
    async (imageId) => {
      try {
        const image = await api.get(`/images/${imageId}`);

        if (
          image.status === 'PENDING' ||
          image.status === 'PROCESSING'
        ) {
          setIsGenerating(true);
          setGeneratedImage(null);
          return false;
        }

        if (image.status === 'COMPLETED') {
          setGeneratedImage(image);
          setIsGenerating(false);
          setCurrentImageId(null);
          localStorage.removeItem(
            ACTIVE_IMAGE_GENERATION_KEY
          );
          setSuccessMessage(
            '홍보 이미지가 생성되었습니다.'
          );
          return true;
        }

        if (image.status === 'FAILED') {
          setGeneratedImage(null);
          setIsGenerating(false);
          setCurrentImageId(null);
          localStorage.removeItem(
            ACTIVE_IMAGE_GENERATION_KEY
          );
          setErrorMessage(
            image.errorMessage ||
              '이미지 생성에 실패했습니다.'
          );
          return true;
        }

        return false;
      } catch (error) {
        // 일시적인 네트워크 오류 때문에 생성 작업 자체를 취소하지 않습니다.
        console.error(
          '이미지 생성 상태 조회 실패:',
          error
        );
        return false;
      }
    },
    []
  );

  /**
   * 생성 요청 직후와 F5 새로고침 후 모두 동일하게 동작합니다.
   *
   * currentImageId가 존재하면 CreateImage에서 계속 생성 중 UI를 보여주고
   * 2.5초마다 서버 상태를 확인합니다.
   */
  useEffect(() => {
    if (!currentImageId) {
      return undefined;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    checkGenerationStatus(currentImageId);

    const intervalId = window.setInterval(() => {
      checkGenerationStatus(currentImageId);
    }, IMAGE_POLL_INTERVAL);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [currentImageId, checkGenerationStatus]);

  /**
   * 현재 선택한 개별 고객입니다.
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
   * 현재 선택한 고객 그룹입니다.
   */
  const selectedGroup = useMemo(
    () =>
      groups.find(
        (group) =>
          Number(group.groupNum) ===
          Number(selectedGroupNum)
      ) || null,
    [groups, selectedGroupNum]
  );

  /**
   * 선택된 그룹에 속한 고객 목록입니다.
   */
  const groupContacts = useMemo(() => {
    if (!selectedGroup) return [];
    return contacts.filter(
      (contact) =>
        Number(contact.groupNum) ===
        Number(selectedGroup.groupNum)
    );
  }, [contacts, selectedGroup]);

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
   * 고객 또는 그룹 정보를 사용해
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

    if (targetType === 'contact' && selectedContact) {
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
    } else if (targetType === 'group' && selectedGroup) {
      promptParts.push(
        `홍보 대상 그룹: ${selectedGroup.groupName}`
      );
      if (selectedGroup.conDescription) {
        promptParts.push(
          `그룹 설명: ${selectedGroup.conDescription}`
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
   * 홍보 이미지 생성을 요청합니다.
   *
   * POST /images는 실제 이미지 완성을 기다리지 않고
   * imageId와 PENDING 상태를 즉시 반환합니다.
   * 이후 완료 여부는 위 polling 로직이 CreateImage에서 계속 확인합니다.
   */
  const handleGenerateImage = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setGeneratedImage(null);

    if (targetType === 'contact' && !selectedContactNum) {
      setErrorMessage(
        '홍보 대상 고객을 선택해주세요.'
      );
      return;
    }

    if (targetType === 'group' && !selectedGroupNum) {
      setErrorMessage(
        '홍보 대상 그룹을 선택해주세요.'
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
      const payload = {
        proNum: Number(selectedProductNum),
        promptText: finalPrompt,
      };

      if (targetType === 'contact') {
        payload.conNum = Number(selectedContactNum);
      } else {
        payload.groupNum = Number(selectedGroupNum);
      }

      const accepted = await api.post(
        '/images',
        payload
      );

      if (!accepted?.imageId) {
        throw new Error(
          '이미지 생성 작업 번호를 받지 못했습니다.'
        );
      }

      const imageId = Number(accepted.imageId);

      localStorage.setItem(
        ACTIVE_IMAGE_GENERATION_KEY,
        String(imageId)
      );

      setCurrentImageId(imageId);
      setIsGenerating(true);
      setGeneratedImage(null);
      setSuccessMessage('');
    } catch (error) {
      setIsGenerating(false);
      setCurrentImageId(null);
      localStorage.removeItem(
        ACTIVE_IMAGE_GENERATION_KEY
      );

      setErrorMessage(
        error.message ||
          '이미지 생성 요청 중 오류가 발생했습니다.'
      );
    }
  };


  return (
    <div
      className="
        min-h-screen
        bg-[#eee9df]
        text-[#17372a]
        antialiased
        flex
        flex-col
        selection:bg-[#17372a]
        selection:text-white
      "
      style={{
        fontFamily:
          '"SUIT Variable", SUIT, -apple-system, BlinkMacSystemFont, "Noto Sans KR", sans-serif',
      }}
    >
      <style>
        {`
          @import url('https://cdn.jsdelivr.net/gh/sunn-us/SUIT/fonts/variable/woff2/SUIT-Variable.css');
        `}
      </style>

      <Header />

      <main
        className="
          max-w-[1360px]
          mx-auto
          px-6
          sm:px-10
          py-10
          lg:py-12
          w-full
          flex-1
          space-y-10
        "
      >
        <div>
          <div
            className="
              flex
              items-center
              gap-3
              text-[#64756b]
              text-[13px]
              font-medium
              tracking-[0.12em]
              mb-3
            "
          >
            <span className="w-7 h-[1px] bg-[#64756b]/60" />

            AI IMAGE STUDIO
          </div>

          <h1
            className="
              text-[32px]
              sm:text-[38px]
              font-bold
              tracking-[-0.03em]
              text-[#17372a]
            "
          >
            AI 홍보 이미지 만들기
          </h1>

          <p
            className="
              text-[#59685f]
              text-[16px]
              sm:text-[17px]
              font-normal
              mt-2
            "
          >
            고객 또는 고객 그룹과 상품을 선택하면 AI가 맞춤형 홍보 이미지를 만들어 드립니다.
          </p>
        </div>

        {errorMessage && (
          <div
            className="
              bg-[#f8e7e3]
              border-l-[3px]
              border-[#b45a47]
              px-5
              py-4
              text-[14px]
              font-medium
              text-[#873c2e]
              rounded-[4px_14px_4px_14px]
            "
          >
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            className="
              bg-[#e8f3ee]
              border-l-[3px]
              border-[#17372a]
              px-5
              py-4
              text-[14px]
              font-medium
              text-[#17372a]
              rounded-[4px_14px_4px_14px]
            "
          >
            {successMessage}
          </div>
        )}

        {isLoading ? (
          <div
            className="
              bg-[#f8f0e2]
              border
              border-[#17372a]/25
              rounded-none
              p-16
              text-center
              text-[#748078]
              text-[16px]
              font-normal
            "
          >
            고객과 상품 정보를 불러오는 중입니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-8">
              {/* 1. 홍보 대상 선택 */}
              <section
                className="
                  bg-[#f8f0e2]
                  border
                  border-[#17372a]/25
                  rounded-none
                  p-8
                  lg:p-10
                  shadow-[0_18px_50px_rgba(40,48,42,0.08)]
                  space-y-6
                "
              >
                <div>
                  <h2
                    className="
                      text-[24px]
                      font-bold
                      text-[#17372a]
                      tracking-[-0.02em]
                    "
                  >
                    1. 홍보 대상 선택
                  </h2>

                  <p
                    className="
                      text-[15px]
                      text-[#59675f]
                      font-normal
                      mt-1.5
                    "
                  >
                    개별 고객 또는 고객 그룹을 선택하여 이미지 생성 내용에 반영하세요.
                  </p>
                </div>

                {/* 대상 유형 선택 탭 */}
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#f0e8dc] rounded-none border border-[#17372a]/20">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('contact');
                      setGeneratedImage(null);
                      setSuccessMessage('');
                    }}
                    className={`
                      py-3
                      rounded-none
                      text-[15px]
                      font-semibold
                      transition-all
                      ${
                        targetType === 'contact'
                          ? 'bg-[#17372a] text-white shadow-sm'
                          : 'text-[#59675f] hover:text-[#17372a]'
                      }
                    `}
                  >
                    개별 고객 선택
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('group');
                      setGeneratedImage(null);
                      setSuccessMessage('');
                    }}
                    className={`
                      py-3
                      rounded-none
                      text-[15px]
                      font-semibold
                      transition-all
                      ${
                        targetType === 'group'
                          ? 'bg-[#17372a] text-white shadow-sm'
                          : 'text-[#59675f] hover:text-[#17372a]'
                      }
                    `}
                  >
                    고객 그룹 선택
                  </button>
                </div>

                {targetType === 'contact' ? (
                  contacts.length === 0 ? (
                    <EmptyDataBox
                      message="등록된 고객이 없습니다."
                      link="/contact"
                      linkText="고객 등록하러 가기"
                    />
                  ) : (
                    <div className="space-y-5">
                      <select
                        value={selectedContactNum}
                        onChange={(event) => {
                          setSelectedContactNum(
                            event.target.value
                          );
                          setGeneratedImage(null);
                          setSuccessMessage('');
                        }}
                        className="
                          w-full
                          px-4
                          py-3.5
                          border
                          border-[#17372a]/25
                          rounded-none
                          font-normal
                          text-[15px]
                          text-[#17372a]
                          focus:outline-none
                          focus:border-[#17372a]
                          bg-[#f7f3eb]
                        "
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
                        <div
                          className="
                            rounded-none
                            bg-[#f0e8dc]
                            border
                            border-[#17372a]/25
                            p-5
                          "
                        >
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
                    </div>
                  )
                ) : groups.length === 0 ? (
                  <EmptyDataBox
                    message="등록된 고객 그룹이 없습니다."
                    link="/contact"
                    linkText="그룹 등록하러 가기"
                  />
                ) : (
                  <div className="space-y-5">
                    <select
                      value={selectedGroupNum}
                      onChange={(event) => {
                        setSelectedGroupNum(
                          event.target.value
                        );
                        setGeneratedImage(null);
                        setSuccessMessage('');
                      }}
                      className="
                        w-full
                        px-4
                        py-3.5
                        border
                        border-[#17372a]/25
                        rounded-none
                        font-normal
                        text-[15px]
                        text-[#17372a]
                        focus:outline-none
                        focus:border-[#17372a]
                        bg-[#f7f3eb]
                      "
                    >
                      {groups.map((group) => {
                        const cnt = contacts.filter(
                          (c) =>
                            Number(c.groupNum) ===
                            Number(group.groupNum)
                        ).length;
                        return (
                          <option
                            key={group.groupNum}
                            value={group.groupNum}
                          >
                            {group.groupName} (소속 고객 {cnt}명)
                          </option>
                        );
                      })}
                    </select>

                    {selectedGroup && (
                      <div
                        className="
                          rounded-none
                          bg-[#f0e8dc]
                          border
                          border-[#17372a]/25
                          p-5
                          space-y-3
                        "
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <InfoItem
                            label="그룹명"
                            value={selectedGroup.groupName}
                          />

                          <InfoItem
                            label="소속 인원"
                            value={`${groupContacts.length}명`}
                          />
                        </div>

                        <div>
                          <p className="text-[12px] font-semibold text-[#68766e]">
                            그룹 설명
                          </p>

                          <p className="mt-1 text-[14px] text-[#17372a] font-normal">
                            {selectedGroup.conDescription ||
                              '등록된 설명이 없습니다.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* 2. 홍보 상품 선택 */}
              <section
                className="
                  bg-[#f8f0e2]
                  border
                  border-[#17372a]/25
                  rounded-none
                  p-8
                  lg:p-10
                  shadow-[0_18px_50px_rgba(40,48,42,0.08)]
                  space-y-6
                "
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h2
                      className="
                        text-[24px]
                        font-bold
                        text-[#17372a]
                        tracking-[-0.02em]
                      "
                    >
                      2. 홍보 상품 선택
                    </h2>

                    <p
                      className="
                        text-[15px]
                        text-[#59675f]
                        font-normal
                        mt-1.5
                      "
                    >
                      상품 관리에서 등록한 상품을 선택해주세요.
                    </p>
                  </div>

                  <Link
                    to="/product"
                    className="
                      px-4
                      py-2.5
                      border
                      border-[#17372a]/30
                      text-[#17372a]
                      hover:bg-[#17372a]/[0.06]
                      rounded-none
                      text-[13px]
                      font-semibold
                      text-center
                      whitespace-nowrap
                      transition
                    "
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
                  <div className="space-y-5">
                    <select
                      value={selectedProductNum}
                      onChange={(event) => {
                        setSelectedProductNum(
                          event.target.value
                        );
                        setGeneratedImage(null);
                        setSuccessMessage('');
                      }}
                      className="
                        w-full
                        px-4
                        py-3.5
                        border
                        border-[#17372a]/25
                        rounded-none
                        font-normal
                        text-[15px]
                        text-[#17372a]
                        focus:outline-none
                        focus:border-[#17372a]
                        bg-[#f7f3eb]
                      "
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
                          )}{' '}
                          원
                        </option>
                      ))}
                    </select>

                    {selectedProduct && (
                      <div
                        className="
                          rounded-none
                          bg-[#f0e8dc]
                          border
                          border-[#17372a]/25
                          overflow-hidden
                        "
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr]">
                          <div
                            className="
                              bg-[#f7f3eb]
                              border-b
                              sm:border-b-0
                              sm:border-r
                              border-[#17372a]/20
                              min-h-[160px]
                            "
                          >
                            {selectedProduct.referenceImageUrl ? (
                              <img
                                src={
                                  selectedProduct.referenceImageUrl
                                }
                                alt={`${selectedProduct.proName} 참고 이미지`}
                                className="w-full h-44 sm:h-full object-contain p-3"
                              />
                            ) : (
                              <div
                                className="
                                  w-full
                                  h-44
                                  flex
                                  flex-col
                                  items-center
                                  justify-center
                                  text-center
                                  text-[#748078]
                                  font-normal
                                  text-[13px]
                                  p-4
                                "
                              >
                                <span>
                                  등록된 참고 이미지가 없습니다.
                                </span>

                                <Link
                                  to="/product"
                                  className="
                                    mt-2
                                    text-[#17372a]
                                    font-semibold
                                    hover:underline
                                  "
                                >
                                  참고 이미지 등록하기
                                </Link>
                              </div>
                            )}
                          </div>

                          <div className="p-5 space-y-2.5">
                            <div>
                              <p className="text-[11px] font-semibold text-[#68766e]">
                                상품명
                              </p>

                              <p className="text-[17px] font-bold text-[#17372a] mt-0.5">
                                {
                                  selectedProduct.proName
                                }
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <span
                                className="
                                  px-3
                                  py-1
                                  bg-[#17372a]/10
                                  text-[#17372a]
                                  rounded-full
                                  text-[12px]
                                  font-semibold
                                "
                              >
                                {
                                  selectedProduct.category
                                }
                              </span>

                              <span
                                className="
                                  px-3
                                  py-1
                                  bg-[#f7f3eb]
                                  border
                                  border-[#17372a]/25
                                  text-[#59675f]
                                  rounded-full
                                  text-[12px]
                                  font-semibold
                                "
                              >
                                {
                                  selectedProduct.company
                                }
                              </span>
                            </div>

                            <p className="text-[20px] font-bold text-[#17372a] pt-1">
                              {Number(
                                selectedProduct.price
                              ).toLocaleString(
                                'ko-KR'
                              )}{' '}
                              원
                            </p>

                            <p className="text-[14px] text-[#59675f] font-normal leading-relaxed">
                              {selectedProduct.proDescription ||
                                '등록된 상품 설명이 없습니다.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* 3. 추가 요청사항 */}
              <section
                className="
                  bg-[#f8f0e2]
                  border
                  border-[#17372a]/25
                  rounded-none
                  p-8
                  lg:p-10
                  shadow-[0_18px_50px_rgba(40,48,42,0.08)]
                  space-y-6
                "
              >
                <div>
                  <h2
                    className="
                      text-[24px]
                      font-bold
                      text-[#17372a]
                      tracking-[-0.02em]
                    "
                  >
                    3. 추가 요청사항
                  </h2>

                  <p
                    className="
                      text-[15px]
                      text-[#59675f]
                      font-normal
                      mt-1.5
                    "
                  >
                    원하는 색상, 분위기와 강조 문구를 입력해주세요.
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
                        className="
                          w-full
                          p-4
                          bg-[#f0e8dc]
                          border
                          border-[#17372a]/25
                          rounded-none
                          text-left
                          text-[14px]
                          font-normal
                          text-[#17372a]
                          hover:border-[#17372a]
                          transition
                        "
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
                    rows="6"
                    maxLength={3000}
                    placeholder="추가 요청사항을 입력하세요. 입력하지 않아도 상품과 고객(그룹) 정보로 기본 프롬프트가 생성됩니다."
                    className="
                      w-full
                      px-4
                      py-3.5
                      pb-9
                      border
                      border-[#17372a]/25
                      rounded-none
                      font-normal
                      text-[15px]
                      text-[#17372a]
                      resize-none
                      focus:outline-none
                      focus:border-[#17372a]
                      bg-[#f7f3eb]
                      placeholder:text-[#8a968e]
                    "
                  />

                  <span
                    className="
                      absolute
                      right-4
                      bottom-3
                      text-[12px]
                      font-normal
                      text-[#748078]
                    "
                  >
                    {promptText.length} / 3,000자
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={
                    isGenerating ||
                    (targetType === 'contact' && contacts.length === 0) ||
                    (targetType === 'group' && groups.length === 0) ||
                    products.length === 0
                  }
                  className="
                    w-full
                    h-[56px]
                    bg-[#17372a]
                    hover:bg-[#214b39]
                    disabled:bg-[#9ca7a0]
                    disabled:cursor-not-allowed
                    text-white
                    font-semibold
                    text-[16px]
                    rounded-none
                    shadow-[0_14px_30px_rgba(23,55,42,0.15)]
                    transition
                  "
                >
                  {isGenerating
                    ? 'AI 이미지 생성 중...'
                    : 'AI 이미지 생성하기'}
                </button>
              </section>
            </div>

            {/* 생성 결과 영역 */}
            <section
              className="
                bg-[#f8f0e2]
                border
                border-[#17372a]/25
                rounded-none
                p-8
                lg:p-10
                shadow-[0_18px_50px_rgba(40,48,42,0.08)]
                space-y-6
                lg:sticky
                lg:top-28
              "
            >
              <div>
                <h2
                  className="
                    text-[24px]
                    font-bold
                    text-[#17372a]
                    tracking-[-0.02em]
                  "
                >
                  생성 결과
                </h2>

                <p
                  className="
                    text-[15px]
                    text-[#59675f]
                    font-normal
                    mt-1.5
                  "
                >
                  생성된 홍보 이미지를 확인할 수 있습니다.
                </p>
              </div>

              {selectedProduct?.referenceImageUrl && (
                <div
                  className="
                    rounded-none
                    border
                    border-[#17372a]/25
                    bg-[#f0e8dc]
                    p-4
                  "
                >
                  <p className="text-[12px] font-semibold text-[#17372a] mb-3">
                    선택한 상품 참고 이미지
                  </p>

                  <img
                    src={
                      selectedProduct.referenceImageUrl
                    }
                    alt="선택 상품 참고 이미지"
                    className="w-full max-h-48 object-contain rounded-none bg-[#f7f3eb] border border-[#17372a]/20"
                  />
                </div>
              )}

              {isGenerating ? (
                <div
                  className="
                    aspect-square
                    rounded-none
                    bg-[#f0e8dc]
                    border
                    border-[#17372a]/25
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-center
                    p-8
                  "
                >
                  <div
                    className="
                      w-12
                      h-12
                      rounded-full
                      border-4
                      border-[#17372a]/20
                      border-t-[#17372a]
                      animate-spin
                    "
                  />

                  <p className="mt-5 font-bold text-[#17372a] text-[17px]">
                    이미지를 만들고 있습니다.
                  </p>

                  <p className="mt-2 text-[14px] font-normal text-[#59675f]">
                    잠시만 기다려주세요.
                  </p>

                  <p className="mt-1 text-[12px] font-normal text-[#748078]">
                    새로고침해도 생성 작업은 계속 진행됩니다.
                  </p>
                </div>
              ) : generatedImage ? (
                <div className="space-y-5">
                  <div
                    className="
                      aspect-square
                      rounded-none
                      overflow-hidden
                      border
                      border-[#17372a]/25
                      bg-[#f7f3eb]
                    "
                  >
                    <img
                      src={generatedImage.imageUrl}
                      alt="생성된 농자재 홍보 이미지"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[14px]">
                    <div
                      className="
                        rounded-none
                        bg-[#f0e8dc]
                        border
                        border-[#17372a]/25
                        p-4
                      "
                    >
                      <p className="text-[12px] font-normal text-[#59675f]">
                        이미지 번호
                      </p>

                      <p className="font-bold text-[#17372a] mt-1">
                        {generatedImage.imageId}
                      </p>
                    </div>

                    <div
                      className="
                        rounded-none
                        bg-[#f0e8dc]
                        border
                        border-[#17372a]/25
                        p-4
                      "
                    >
                      <p className="text-[12px] font-normal text-[#59675f]">
                        다운로드 수
                      </p>

                      <p className="font-bold text-[#17372a] mt-1">
                        {generatedImage.download ?? 0} 회
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/manageimage"
                    className="
                      block
                      w-full
                      h-[50px]
                      leading-[50px]
                      text-center
                      border
                      border-[#17372a]/30
                      text-[#17372a]
                      hover:bg-[#17372a]/[0.05]
                      rounded-none
                      font-semibold
                      text-[15px]
                      transition
                    "
                  >
                    이미지 관리에서 확인하기
                  </Link>
                </div>
              ) : (
                <div
                  className="
                    aspect-square
                    rounded-none
                    bg-[#f0e8dc]
                    border
                    border-dashed
                    border-[#17372a]/40
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-center
                    p-8
                  "
                >
                  <p className="font-bold text-[#17372a] text-[17px]">
                    아직 생성된 이미지가 없습니다.
                  </p>

                  <p className="mt-2 text-[14px] font-normal text-[#59675f]">
                    홍보 대상과 상품을 선택한 후 이미지를 생성해주세요.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <footer
        className="
          w-full
          bg-[#10291f]
          text-white
          py-8
          text-center
          mt-14
        "
      >
        <div
          className="
            max-w-[1360px]
            mx-auto
            px-6
            sm:px-10
            flex
            flex-col
            sm:flex-row
            items-center
            justify-between
            gap-3
          "
        >
          <p className="text-[14px] font-bold">
            FarMMS
          </p>

          <p className="text-white/50 text-[13px] font-normal">
            © 2026 FarMMS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-[#68766e]">
        {label}
      </p>

      <p className="mt-0.5 font-bold text-[#17372a] text-[15px]">
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
    <div
      className="
        rounded-none
        bg-[#f0e8dc]
        border
        border-[#17372a]/25
        p-5
        text-[14px]
        font-normal
        text-[#17372a]
      "
    >
      <p>{message}</p>

      <Link
        to={link}
        className="inline-block mt-2.5 text-[#17372a] font-semibold hover:underline"
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