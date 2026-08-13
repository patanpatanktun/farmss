import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Link,
  useLocation,
} from 'react-router-dom';
import { api } from '../api/api';
import Header from './Header';

const EMPTY_RESULT = {
  totalCount: 0,
  successCount: 0,
  failCount: 0,
  status: '',
  message: '',
};

const HOUR_OPTIONS = Array.from(
  { length: 12 },
  (_, index) => String(index + 1).padStart(2, '0')
);

const MINUTE_OPTIONS = Array.from(
  { length: 60 },
  (_, index) => String(index).padStart(2, '0')
);

export default function SendMms() {
  const location = useLocation();

  const passedImageId =
    location.state?.imageId;

  const [contacts, setContacts] =
    useState([]);

  const [groups, setGroups] =
    useState([]);

  const [images, setImages] =
    useState([]);

  const [products, setProducts] =
    useState([]);

  const [
    selectedContactNums,
    setSelectedContactNums,
  ] = useState([]);

  const [
    selectedImageId,
    setSelectedImageId,
  ] = useState('');

  const [filters, setFilters] = useState({
    region: '',
    crop: '',
    groupNum: '',
  });

  const [senderNumber, setSenderNumber] =
    useState('');

  const [content, setContent] =
    useState('');

  const [reserve, setReserve] =
    useState(false);

  const [reserveDate, setReserveDate] =
    useState('');

  const [reserveDay, setReserveDay] =
    useState('');

  const [reserveHour, setReserveHour] =
    useState('');

  const [reserveMinute, setReserveMinute] =
    useState('');

  const [reservePeriod, setReservePeriod] =
    useState('오후');

  const [sendResult, setSendResult] =
    useState(EMPTY_RESULT);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSending, setIsSending] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  const [successMessage, setSuccessMessage] =
    useState('');

  /**
   * 고객, 그룹, 이미지, 상품,
   * FarMMS 공통 발신번호를 조회합니다.
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const [
        contactData,
        groupData,
        imageData,
        productData,
        senderData,
      ] = await Promise.all([
        api.get('/contacts'),
        api.get('/contact-groups'),
        api.get('/images'),
        api.get('/products'),
        api.get('/mms/sender'),
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

      const loadedImages = Array.isArray(
        imageData
      )
        ? imageData
        : [];

      const loadedProducts = Array.isArray(
        productData
      )
        ? productData
        : [];

      setContacts(loadedContacts);
      setGroups(loadedGroups);
      setImages(loadedImages);
      setProducts(loadedProducts);

      /**
       * 솔라피에 등록된 FarMMS 운영자
       * 대표 발신번호를 저장합니다.
       */
      setSenderNumber(
        senderData?.senderNumber
          ? String(senderData.senderNumber)
          : ''
      );

      /**
       * 처음에는 전체 고객을 선택합니다.
       */
      setSelectedContactNums(
        loadedContacts.map(
          (contact) => contact.conNum
        )
      );

      const passedImageExists =
        loadedImages.some(
          (image) =>
            Number(image.imageId) ===
            Number(passedImageId)
        );

      if (passedImageExists) {
        setSelectedImageId(
          String(passedImageId)
        );
      } else if (loadedImages.length > 0) {
        setSelectedImageId(
          String(loadedImages[0].imageId)
        );
      }
    } catch (error) {
      setErrorMessage(
        error.message ||
          'MMS 발송 정보를 불러오지 못했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [passedImageId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * 날짜, 오전·오후, 시, 분을 서버 전송용
   * datetime-local 값으로 합칩니다.
   */
  useEffect(() => {
    if (
      !reserveDay ||
      !reserveHour ||
      !reserveMinute
    ) {
      setReserveDate('');
      return;
    }

    let hour = Number(reserveHour);

    if (reservePeriod === '오전' && hour === 12) {
      hour = 0;
    } else if (
      reservePeriod === '오후' &&
      hour !== 12
    ) {
      hour += 12;
    }

    setReserveDate(
      `${reserveDay}T${String(hour).padStart(
        2,
        '0'
      )}:${reserveMinute}`
    );
  }, [
    reserveDay,
    reserveHour,
    reserveMinute,
    reservePeriod,
  ]);

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
   * 그룹 번호로 그룹명을 찾습니다.
   */
  const groupMap = useMemo(() => {
    const result = new Map();

    groups.forEach((group) => {
      result.set(
        Number(group.groupNum),
        group.groupName
      );
    });

    return result;
  }, [groups]);

  /**
   * 쉼표로 입력된 검색어를 분리합니다.
   */
  const splitKeywords = (value) => {
    if (!value || !value.trim()) {
      return [];
    }

    return [
      ...new Set(
        value
          .split(/[,/|]+/)
          .map((keyword) =>
            keyword.trim().toLowerCase()
          )
          .filter(Boolean)
      ),
    ];
  };

  /**
   * 검색어 중 하나가 대상 문자열에 포함되는지 확인합니다.
   */
  const includesAnyKeyword = (
    target,
    keywords
  ) => {
    if (keywords.length === 0) {
      return true;
    }

    const normalizedTarget = String(
      target || ''
    ).toLowerCase();

    return keywords.some((keyword) =>
      normalizedTarget.includes(keyword)
    );
  };

  /**
   * 지역, 작물, 그룹 조건에 해당하는 고객입니다.
   */
  const filteredContacts = useMemo(() => {
    const regionKeywords =
      splitKeywords(filters.region);

    const cropKeywords =
      splitKeywords(filters.crop);

    return contacts.filter((contact) => {
      const matchesRegion =
        includesAnyKeyword(
          contact.region,
          regionKeywords
        );

      const matchesCrop =
        includesAnyKeyword(
          contact.crop,
          cropKeywords
        );

      const matchesGroup =
        !filters.groupNum ||
        Number(contact.groupNum) ===
          Number(filters.groupNum);

      return (
        matchesRegion &&
        matchesCrop &&
        matchesGroup
      );
    });
  }, [contacts, filters]);

  const selectedImage = useMemo(
    () =>
      images.find(
        (image) =>
          Number(image.imageId) ===
          Number(selectedImageId)
      ) || null,
    [images, selectedImageId]
  );

  const selectedProduct = useMemo(() => {
    if (!selectedImage) {
      return null;
    }

    return (
      productMap.get(
        Number(selectedImage.proNum)
      ) || null
    );
  }, [selectedImage, productMap]);

  const selectedContactSet = useMemo(
    () => new Set(selectedContactNums),
    [selectedContactNums]
  );

  const allVisibleSelected =
    filteredContacts.length > 0 &&
    filteredContacts.every((contact) =>
      selectedContactSet.has(
        contact.conNum
      )
    );

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFilterReset = () => {
    setFilters({
      region: '',
      crop: '',
      groupNum: '',
    });
  };

  /**
   * 고객 한 명을 선택하거나 해제합니다.
   */
  const handleContactToggle = (conNum) => {
    setSelectedContactNums((previous) => {
      if (previous.includes(conNum)) {
        return previous.filter(
          (number) => number !== conNum
        );
      }

      return [...previous, conNum];
    });
  };

  /**
   * 현재 검색된 고객을 전체 선택하거나 해제합니다.
   */
  const handleVisibleContactsToggle = () => {
    const visibleNumbers =
      filteredContacts.map(
        (contact) => contact.conNum
      );

    setSelectedContactNums((previous) => {
      const previousSet =
        new Set(previous);

      const everySelected =
        visibleNumbers.every((number) =>
          previousSet.has(number)
        );

      if (everySelected) {
        return previous.filter(
          (number) =>
            !visibleNumbers.includes(number)
        );
      }

      visibleNumbers.forEach((number) => {
        previousSet.add(number);
      });

      return Array.from(previousSet);
    });
  };

  /**
   * MMS 발송 요청값을 검사합니다.
   */
  const validateSendForm = () => {
    const normalizedSenderNumber =
      senderNumber.replace(/[^0-9]/g, '');

    if (
      normalizedSenderNumber.length < 8 ||
      normalizedSenderNumber.length > 11
    ) {
      return 'FarMMS 대표 발신번호를 불러오지 못했습니다.';
    }

    if (!normalizedSenderNumber.startsWith('0')) {
      return 'FarMMS 대표 발신번호 설정이 올바르지 않습니다.';
    }

    if (!content.trim()) {
      return 'MMS 발송 문구를 입력해주세요.';
    }

    if (content.trim().length > 2000) {
      return 'MMS 발송 문구는 2,000자 이하로 입력해주세요.';
    }

    if (!selectedImageId) {
      return '발송할 홍보 이미지를 선택해주세요.';
    }

    if (selectedContactNums.length === 0) {
      return '발송 대상 고객을 한 명 이상 선택해주세요.';
    }

    if (reserve) {
      if (!reserveDate) {
        return '예약 발송 날짜와 시간을 선택해주세요.';
      }

      const selectedReserveDate = new Date(reserveDate);

      if (Number.isNaN(selectedReserveDate.getTime())) {
        return '예약 발송 날짜와 시간이 올바르지 않습니다.';
      }

      if (selectedReserveDate.getTime() <= Date.now()) {
        return '예약 발송 시간은 현재 시간 이후여야 합니다.';
      }
    }

    return '';
  };

  /**
   * 선택한 고객들에게 MMS를 발송합니다.
   */
  const handleSend = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    setSendResult(EMPTY_RESULT);

    const validationMessage =
      validateSendForm();

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    const sendTypeMessage = reserve
      ? `예약 시간: ${formatReserveDate(reserveDate)}\n\n예약 발송으로 접수됩니다.`
      : '솔라피를 통해 실제 MMS가 즉시 발송됩니다.';

    const confirmed = window.confirm(
      `선택한 ${selectedContactNums.length}명에게 MMS를 발송하시겠습니까?\n\n` +
        `발신번호: ${formatPhone(senderNumber)}\n\n` +
        sendTypeMessage
    );

    if (!confirmed) {
      return;
    }

    setIsSending(true);

    try {
      const data = await api.post(
        '/mms/send',
        {
          fromNumber:
            senderNumber.replace(
              /[^0-9]/g,
              ''
            ),
          content: content.trim(),
          imageId: Number(
            selectedImageId
          ),
          contactNums:
            selectedContactNums,
          reserve,
          reserveDate: reserve
            ? new Date(reserveDate).toISOString()
            : null,
        }
      );

      setSendResult({
        totalCount:
          data?.totalCount ?? 0,
        successCount:
          data?.successCount ?? 0,
        failCount:
          data?.failCount ?? 0,
        status:
          data?.status || '',
        message:
          data?.message ||
          'MMS 발송 처리가 완료되었습니다.',
      });

      setSuccessMessage(
        data?.message ||
          'MMS 발송 처리가 완료되었습니다.'
      );
    } catch (error) {
      setErrorMessage(
        error.message ||
          'MMS 발송 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-slate-100 text-gray-900 min-h-screen flex flex-col justify-between font-sans antialiased">
      <Header />

      <main className="max-w-[1200px] mx-auto px-6 sm:px-10 py-10 w-full flex-1 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            MMS 발송
          </h1>

          <p className="text-gray-700 font-bold mt-2">
            수신 고객과 홍보 이미지를 선택하고
            MMS 문구를 작성해주세요.
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
          <div className="bg-white rounded-3xl border border-gray-200 p-16 shadow-md text-center text-gray-500 font-bold">
            MMS 발송 정보를 불러오는 중입니다.
          </div>
        ) : (
          <>
            <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-md space-y-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  1. 수신 고객 선택
                </h2>

                <p className="text-sm text-gray-600 font-bold mt-1">
                  지역, 재배작물 또는 고객 그룹으로
                  발송 대상을 선택할 수 있습니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  name="region"
                  value={filters.region}
                  onChange={handleFilterChange}
                  placeholder="지역 검색 (예: 광주, 나주)"
                  className="px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-700"
                />

                <input
                  type="text"
                  name="crop"
                  value={filters.crop}
                  onChange={handleFilterChange}
                  placeholder="작물 검색 (예: 배, 벼)"
                  className="px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-700"
                />

                <select
                  name="groupNum"
                  value={filters.groupNum}
                  onChange={handleFilterChange}
                  className="px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm font-black bg-white focus:outline-none focus:border-emerald-700"
                >
                  <option value="">
                    전체 그룹
                  </option>

                  {groups.map((group) => (
                    <option
                      key={group.groupNum}
                      value={group.groupNum}
                    >
                      {group.groupName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={
                      handleVisibleContactsToggle
                    }
                    disabled={
                      filteredContacts.length === 0
                    }
                    className="px-4 py-2.5 border-2 border-emerald-700 text-emerald-700 hover:bg-emerald-50 disabled:border-gray-200 disabled:text-gray-400 rounded-xl text-xs font-black"
                  >
                    {allVisibleSelected
                      ? '검색 결과 선택 해제'
                      : '검색 결과 전체 선택'}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedContactNums([])
                    }
                    className="px-4 py-2.5 border-2 border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-black"
                  >
                    전체 선택 해제
                  </button>

                  <button
                    type="button"
                    onClick={handleFilterReset}
                    className="px-4 py-2.5 border-2 border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-black"
                  >
                    검색 초기화
                  </button>
                </div>

                <p className="text-sm font-black text-gray-700">
                  검색 결과{' '}
                  <span className="text-emerald-700">
                    {filteredContacts.length}
                  </span>
                  명 · 선택{' '}
                  <span className="text-emerald-700">
                    {selectedContactNums.length}
                  </span>
                  명
                </p>
              </div>

              {contacts.length === 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm font-bold text-amber-800">
                  등록된 고객이 없습니다.

                  <Link
                    to="/contact"
                    className="block mt-3 text-emerald-700 font-black hover:underline"
                  >
                    고객 등록하러 가기 →
                  </Link>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-slate-50 p-8 text-center text-gray-500 font-bold">
                  검색 조건에 해당하는 고객이 없습니다.
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-2xl">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-slate-50 border-b border-gray-200">
                      <tr className="text-xs font-black text-gray-600">
                        <th className="px-4 py-3 text-center">
                          선택
                        </th>

                        <th className="px-4 py-3">
                          고객명
                        </th>

                        <th className="px-4 py-3">
                          전화번호
                        </th>

                        <th className="px-4 py-3">
                          지역
                        </th>

                        <th className="px-4 py-3">
                          작물
                        </th>

                        <th className="px-4 py-3">
                          그룹
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {filteredContacts.map(
                        (contact) => (
                          <tr
                            key={contact.conNum}
                            className="hover:bg-slate-50"
                          >
                            <td className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={selectedContactSet.has(
                                  contact.conNum
                                )}
                                onChange={() =>
                                  handleContactToggle(
                                    contact.conNum
                                  )
                                }
                                className="w-4 h-4 rounded text-emerald-700"
                              />
                            </td>

                            <td className="px-4 py-3 text-sm font-black">
                              {contact.conName}
                            </td>

                            <td className="px-4 py-3 text-sm font-bold whitespace-nowrap">
                              {formatPhone(
                                contact.phone
                              )}
                            </td>

                            <td className="px-4 py-3 text-sm font-bold">
                              {contact.region ||
                                '-'}
                            </td>

                            <td className="px-4 py-3 text-sm font-bold">
                              {contact.crop ||
                                '-'}
                            </td>

                            <td className="px-4 py-3 text-sm font-bold whitespace-nowrap">
                              {contact.groupNum
                                ? groupMap.get(
                                    Number(
                                      contact.groupNum
                                    )
                                  ) ||
                                  '알 수 없는 그룹'
                                : '미분류'}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-md space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    2. 발송 이미지 선택
                  </h2>

                  <p className="text-sm text-gray-600 font-bold mt-1">
                    이미지 관리에서 생성한 홍보
                    이미지를 선택해주세요.
                  </p>
                </div>

                <Link
                  to="/manageimage"
                  className="px-4 py-2.5 border-2 border-emerald-700 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-black whitespace-nowrap"
                >
                  이미지 관리
                </Link>
              </div>

              {images.length === 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm font-bold text-amber-800">
                  발송할 이미지가 없습니다.

                  <Link
                    to="/createimage"
                    className="block mt-3 text-emerald-700 font-black hover:underline"
                  >
                    이미지 만들러 가기 →
                  </Link>
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-3">
                  {images.map((image) => {
                    const product =
                      productMap.get(
                        Number(image.proNum)
                      );

                    const isSelected =
                      Number(selectedImageId) ===
                      Number(image.imageId);

                    return (
                      <button
                        key={image.imageId}
                        type="button"
                        onClick={() =>
                          setSelectedImageId(
                            String(
                              image.imageId
                            )
                          )
                        }
                        className={`w-52 flex-shrink-0 rounded-2xl border-2 p-3 text-left transition ${
                          isSelected
                            ? 'border-emerald-700 bg-emerald-50'
                            : 'border-gray-200 bg-white hover:border-emerald-400'
                        }`}
                      >
                        <div className="aspect-square rounded-xl overflow-hidden bg-slate-50 border border-gray-200">
                          <img
                            src={image.imageUrl}
                            alt="MMS 발송 이미지"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <p className="mt-3 font-black text-sm text-gray-900 truncate">
                          {product?.proName ||
                            `이미지 ${image.imageId}`}
                        </p>

                        <p
                          className={`mt-1 text-xs font-black ${
                            isSelected
                              ? 'text-emerald-700'
                              : 'text-gray-500'
                          }`}
                        >
                          {isSelected
                            ? '선택됨 ✓'
                            : '선택하기'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedImage && (
                <div className="rounded-2xl bg-slate-50 border border-gray-200 p-5 grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-5">
                  <img
                    src={selectedImage.imageUrl}
                    alt="선택한 발송 이미지"
                    className="w-full h-32 object-cover rounded-xl border border-gray-200 bg-white"
                  />

                  <div className="space-y-2">
                    <p className="text-xs font-black text-gray-500">
                      선택한 상품
                    </p>

                    <p className="text-lg font-black text-gray-900">
                      {selectedProduct?.proName ||
                        '상품 정보 없음'}
                    </p>

                    <p className="text-sm font-bold text-gray-600">
                      {selectedProduct?.category ||
                        '-'}{' '}
                      ·{' '}
                      {selectedProduct?.company ||
                        '-'}
                    </p>

                    {selectedProduct && (
                      <p className="text-lg font-black text-emerald-700">
                        {Number(
                          selectedProduct.price
                        ).toLocaleString(
                          'ko-KR'
                        )}
                        원
                      </p>
                    )}
                  </div>
                </div>
              )}
            </section>

            <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-md space-y-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  3. 발송 내용 입력
                </h2>

                <p className="text-sm text-gray-600 font-bold mt-1">
                  솔라피에 등록된 FarMMS 운영자
                  대표번호로 모든 MMS가 발송됩니다.
                </p>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="senderNumber"
                  className="block text-sm font-black text-gray-800"
                >
                  발신번호
                </label>

                <input
                  type="text"
                  id="senderNumber"
                  value={
                    senderNumber
                      ? formatPhone(senderNumber)
                      : ''
                  }
                  readOnly
                  placeholder="FarMMS 대표 발신번호"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-black bg-slate-100 text-gray-700 cursor-not-allowed"
                />

                <p className="text-xs text-gray-500 font-bold px-1">
                  발신번호는 사용자가 수정할 수 없으며,
                  FarMMS 운영자 대표번호로 고정됩니다.
                </p>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="mmsContent"
                  className="block text-sm font-black text-gray-800"
                >
                  발송 문구
                </label>

                <div className="relative">
                  <textarea
                    id="mmsContent"
                    value={content}
                    onChange={(event) =>
                      setContent(
                        event.target.value
                      )
                    }
                    rows={8}
                    maxLength={2000}
                    placeholder="고객에게 발송할 MMS 내용을 입력해주세요."
                    className="w-full p-4 pb-9 border-2 border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:border-emerald-700 bg-slate-50/50 resize-none"
                  />

                  <span className="absolute right-4 bottom-3 text-xs font-black text-gray-500">
                    {content.length} / 2,000자
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <p className="block text-sm font-black text-gray-800">
                  발송 방식
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setReserve(false);
                      setReserveDate('');
                      setReserveDay('');
                      setReserveHour('');
                      setReserveMinute('');
                      setReservePeriod('오후');
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition ${
                      !reserve
                        ? 'border-emerald-700 bg-emerald-50'
                        : 'border-gray-200 bg-white hover:border-emerald-300'
                    }`}
                  >
                    <span className="block font-black text-gray-900">
                      즉시 발송
                    </span>
                    <span className="block mt-1 text-xs font-bold text-gray-500">
                      발송 요청 후 바로 전송합니다.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReserve(true)}
                    className={`p-4 rounded-2xl border-2 text-left transition ${
                      reserve
                        ? 'border-emerald-700 bg-emerald-50'
                        : 'border-gray-200 bg-white hover:border-emerald-300'
                    }`}
                  >
                    <span className="block font-black text-gray-900">
                      예약 발송
                    </span>
                    <span className="block mt-1 text-xs font-bold text-gray-500">
                      지정한 날짜와 시간에 전송합니다.
                    </span>
                  </button>
                </div>

                {reserve && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                    <p className="block text-sm font-black text-gray-800 mb-3">
                      예약 날짜 및 시간
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr] gap-3">
                      <div>
                        <label
                          htmlFor="reserveDay"
                          className="block mb-2 text-xs font-black text-gray-600"
                        >
                          날짜
                        </label>

                        <input
                          type="date"
                          id="reserveDay"
                          value={reserveDay}
                          min={getMinimumReserveDay()}
                          onChange={(event) =>
                            setReserveDay(event.target.value)
                          }
                          className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-black bg-white focus:outline-none focus:border-emerald-700"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="reservePeriod"
                          className="block mb-2 text-xs font-black text-gray-600"
                        >
                          오전/오후
                        </label>

                        <select
                          id="reservePeriod"
                          value={reservePeriod}
                          onChange={(event) =>
                            setReservePeriod(event.target.value)
                          }
                          className="w-full px-3 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-black bg-white focus:outline-none focus:border-emerald-700"
                        >
                          <option value="오전">오전</option>
                          <option value="오후">오후</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="reserveHour"
                          className="block mb-2 text-xs font-black text-gray-600"
                        >
                          시
                        </label>

                        <select
                          id="reserveHour"
                          value={reserveHour}
                          onChange={(event) =>
                            setReserveHour(event.target.value)
                          }
                          className="w-full px-3 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-black bg-white focus:outline-none focus:border-emerald-700"
                        >
                          <option value="">시</option>
                          {HOUR_OPTIONS.map((hour) => (
                            <option key={hour} value={hour}>
                              {hour}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="reserveMinute"
                          className="block mb-2 text-xs font-black text-gray-600"
                        >
                          분
                        </label>

                        <select
                          id="reserveMinute"
                          value={reserveMinute}
                          onChange={(event) =>
                            setReserveMinute(event.target.value)
                          }
                          className="w-full px-3 py-3.5 border-2 border-gray-200 rounded-2xl text-sm font-black bg-white focus:outline-none focus:border-emerald-700"
                        >
                          <option value="">분</option>
                          {MINUTE_OPTIONS.map((minute) => (
                            <option key={minute} value={minute}>
                              {minute}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <p className="mt-2 text-xs font-bold text-gray-500">
                      현재 시간 이후의 날짜와 시간을 선택해주세요.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-md space-y-5">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  4. 발송 내용 확인
                </h2>

                <p className="text-sm text-gray-600 font-bold mt-1">
                  {reserve
                    ? '선택한 시간에 맞춰 예약 발송됩니다.'
                    : '솔라피를 통해 실제 MMS가 즉시 발송됩니다.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                <SummaryItem
                  label="선택 수신자"
                  value={`${selectedContactNums.length}명`}
                />

                <SummaryItem
                  label="선택 이미지"
                  value={
                    selectedProduct?.proName ||
                    '미선택'
                  }
                />

                <SummaryItem
                  label="발신번호"
                  value={
                    senderNumber
                      ? formatPhone(senderNumber)
                      : '설정 오류'
                  }
                />

                <SummaryItem
                  label="발송 방식"
                  value={
                    reserve
                      ? reserveDate
                        ? `예약 · ${formatReserveDate(reserveDate)}`
                        : '예약 시간 미선택'
                      : '즉시 발송'
                  }
                />
              </div>

              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl shadow-md"
              >
                {isSending
                  ? reserve
                    ? 'MMS 예약 접수 중...'
                    : 'MMS 발송 처리 중...'
                  : reserve
                    ? `${selectedContactNums.length}명에게 예약 발송하기`
                    : `${selectedContactNums.length}명에게 MMS 발송하기`}
              </button>
            </section>

            {sendResult.status && (
              <section className="bg-white rounded-3xl border border-gray-200 p-8 shadow-md space-y-6">
                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    발송 결과
                  </h2>

                  <p className="text-sm text-gray-600 font-bold mt-1">
                    {sendResult.message}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <SummaryItem
                    label="전체"
                    value={`${sendResult.totalCount}건`}
                  />

                  <SummaryItem
                    label="성공"
                    value={`${sendResult.successCount}건`}
                    color="text-emerald-700"
                  />

                  <SummaryItem
                    label="실패"
                    value={`${sendResult.failCount}건`}
                    color="text-red-600"
                  />
                </div>

                <div className="flex justify-end">
                  <Link
                    to="/checkmms"
                    className="px-6 py-3 border-2 border-emerald-700 text-emerald-700 hover:bg-emerald-50 rounded-2xl font-black text-sm"
                  >
                    발송 내역 확인하기
                  </Link>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <footer className="w-full bg-white border-t border-gray-200 py-6 px-10 text-center text-gray-600 text-xs mt-12 shadow-sm">
        <p className="font-bold">
          © 2026 FarMMS. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  color = 'text-gray-900',
}) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-gray-200 p-5">
      <p className="text-xs font-black text-gray-500">
        {label}
      </p>

      <p
        className={`mt-2 text-lg font-black ${color}`}
      >
        {value}
      </p>
    </div>
  );
}

function formatPhone(phone) {
  if (!phone) {
    return '-';
  }

  const numbers = String(phone).replace(
    /[^0-9]/g,
    ''
  );

  if (numbers.length === 11) {
    return numbers.replace(
      /(\d{3})(\d{4})(\d{4})/,
      '$1-$2-$3'
    );
  }

  if (
    numbers.startsWith('02') &&
    numbers.length === 9
  ) {
    return numbers.replace(
      /(\d{2})(\d{3})(\d{4})/,
      '$1-$2-$3'
    );
  }

  if (
    numbers.startsWith('02') &&
    numbers.length === 10
  ) {
    return numbers.replace(
      /(\d{2})(\d{4})(\d{4})/,
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

/**
 * 예약 날짜 입력의 최소값으로 사용할
 * 오늘 날짜를 반환합니다.
 */
function getMinimumReserveDay() {
  const date = new Date();
  const timezoneOffset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffset)
    .toISOString()
    .slice(0, 10);
}

/**
 * 예약 시간을 한국어 화면 표시 형식으로 변환합니다.
 */
function formatReserveDate(value) {
  if (!value) {
    return '예약 시간 미선택';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}