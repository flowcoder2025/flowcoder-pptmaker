'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { usePresentationStore } from '@/store/presentationStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useCreditStore } from '@/store/creditStore';
import { TOSS_COLORS, TEMPLATE_EXAMPLES, COLOR_PRESETS } from '@/constants/design';
import { RESEARCH_MODE_CONFIG, type ResearchMode } from '@/types/research';
import { colors } from '@toss/tds-colors';

export default function InputPage() {
  const router = useRouter();
  const {
    generatePresentation,
    isGenerating,
    generationStep,
    generationError,
    clearError,
    selectedColorPresetId,
    setSelectedColorPreset,
    researchMode,
    setResearchMode,
    useProContentModel,
    setUseProContentModel
  } = usePresentationStore();

  // 구독 및 크레딧 상태
  const {
    plan,
    isActive,
  } = useSubscriptionStore();
  const { totalCredits, isFirstTimeFree, getCreditCost } = useCreditStore();

  const [text, setText] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentModalType, setPaymentModalType] = useState<'pro' | 'deep' | null>(null);

  // Pro 또는 Premium 플랜 사용자
  const isPremiumUser = (plan === 'pro' || plan === 'premium') && isActive();

  // 품질 버튼 클릭 핸들러
  const handleQualityClick = (usePro: boolean) => {
    if (!usePro) {
      setUseProContentModel(false);
      return;
    }

    // Pro 모델 선택 시 (고품질 생성 = 50 크래딧)
    const isFirstFree = isFirstTimeFree('qualityGeneration');
    const hasCredit = totalCredits >= getCreditCost('qualityGeneration');

    if (isFirstFree || hasCredit) {
      setUseProContentModel(true);
    } else {
      // 결제 필요
      setPaymentModalType('pro');
      setShowPaymentModal(true);
    }
  };

  // 조사 버튼 클릭 핸들러
  const handleResearchClick = (mode: ResearchMode) => {
    if (mode !== 'deep') {
      setResearchMode(mode);
      return;
    }

    // 깊은 조사 선택 시 (심층 검색 = 40 크래딧)
    const isFirstFree = isFirstTimeFree('deepResearch');
    const hasCredit = totalCredits >= getCreditCost('deepResearch');

    if (isFirstFree || hasCredit) {
      setResearchMode(mode);
    } else {
      // 결제 필요
      setPaymentModalType('deep');
      setShowPaymentModal(true);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      alert('텍스트를 입력해주세요.');
      return;
    }

    await generatePresentation(text);
    router.push('/viewer');
  };

  const handleTemplateClick = (example: string) => {
    setText(example);
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setPaymentModalType(null);
  };

  const handleGoToSubscription = () => {
    router.push('/subscription');
  };

  const handleGoToCredits = () => {
    router.push('/credits');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFFFF',
      padding: '20px',
    }}>
      {/* 헤더 */}
      <div style={{
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: TOSS_COLORS.text,
          margin: 0,
        }}>
          텍스트 입력
        </h2>
      </div>

      {/* 크래딧 잔액 안내 */}
      <div style={{
        marginBottom: '20px',
        padding: '12px 16px',
        background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
        borderRadius: '12px',
        border: '1px solid #C7D2FE',
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: TOSS_COLORS.primary,
          marginBottom: '8px',
        }}>
          💳 보유 크래딧
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '20px',
          fontWeight: 'bold',
          color: TOSS_COLORS.primary,
        }}>
          {totalCredits} 크래딧
          {isPremiumUser && (
            <span style={{
              fontSize: '12px',
              fontWeight: 'normal',
              color: TOSS_COLORS.textSecondary,
            }}>
              (Pro 플랜: 매월 490 크래딧 제공)
            </span>
          )}
        </div>
      </div>

      {/* 슬라이드 수 제한 안내 */}
      <div style={{
        marginBottom: '20px',
        padding: '12px 16px',
        background: plan === 'free' ? colors.yellow50 : colors.grey50,
        borderRadius: '12px',
        border: `1px solid ${plan === 'free' ? colors.yellow200 : colors.grey200}`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: TOSS_COLORS.text,
              marginBottom: '4px',
            }}>
              📄 슬라이드 생성 제한
            </div>
            <div style={{
              fontSize: '13px',
              color: TOSS_COLORS.textSecondary,
            }}>
              {plan === 'free' && '무료 플랜은 한번 생성에 최대 10장까지 만들 수 있어요'}
              {plan === 'pro' && 'Pro 플랜은 한번 생성에 최대 20장까지 만들 수 있어요'}
              {plan === 'premium' && 'Premium 플랜은 한번 생성에 최대 50장까지 만들 수 있어요'}
            </div>
          </div>
          {plan === 'free' && (
            <div style={{ flexShrink: 0 }}>
              <Button
                onClick={() => router.push('/subscription')}
                size="sm"
                
                variant="default"
              >
                업그레이드
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 색상 프리셋 선택 */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: TOSS_COLORS.text,
          marginBottom: '12px',
        }}>
          🎨 색상 테마 선택
        </h3>
        <div style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}>
          {COLOR_PRESETS.map((preset) => {
            const isSelected = selectedColorPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setSelectedColorPreset(preset.id)}
                style={{
                  padding: '12px 16px',
                  background: isSelected ? '#F9FAFB' : '#FFFFFF',
                  border: isSelected ? `2px solid ${preset.primary}` : '1px solid #E5E7EB',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  minWidth: '160px',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: preset.primary,
                  }}></div>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: preset.secondary,
                  }}></div>
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: TOSS_COLORS.text,
                  marginBottom: '4px',
                }}>
                  {preset.name}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: TOSS_COLORS.textSecondary,
                  lineHeight: '1.4',
                }}>
                  {preset.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 자료 조사 모드 선택 */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: TOSS_COLORS.text,
          marginBottom: '12px',
        }}>
          🔍 자료 조사 옵션
        </h3>
        <div style={{
          display: 'flex',
          gap: '12px',
        }}>
          {(Object.keys(RESEARCH_MODE_CONFIG) as ResearchMode[]).map((mode) => {
            const config = RESEARCH_MODE_CONFIG[mode];
            const isSelected = researchMode === mode;
            const price = config.price;

            let priceLabel = '';
            if (price === 0) {
              priceLabel = '무료';
            } else if (mode === 'deep') {
              // 깊은 조사의 경우 크래딧 시스템
              const isFirstFree = isFirstTimeFree('deepResearch');
              const creditCost = getCreditCost('deepResearch');
              const hasCredit = totalCredits >= creditCost;

              if (isFirstFree) {
                priceLabel = '🎁 최초 1회 무료';
              } else if (hasCredit) {
                priceLabel = `${creditCost} 크래딧`;
              } else {
                priceLabel = `${creditCost} 크래딧 필요`;
              }
            } else {
              priceLabel = `+₩${price.toLocaleString()}`;
            }

            return (
              <button
                key={mode}
                onClick={() => handleResearchClick(mode)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: isSelected ? TOSS_COLORS.primary : `${TOSS_COLORS.secondary}15`,
                  color: isSelected ? '#FFFFFF' : TOSS_COLORS.secondary,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ marginBottom: '4px' }}>{config.label}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>{config.description}</div>
                <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '4px', fontWeight: 'bold' }}>
                  {priceLabel}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 콘텐츠 생성 품질 선택 */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: TOSS_COLORS.text,
          marginBottom: '12px',
        }}>
          🤖 생성 품질
        </h3>
        <div style={{
          display: 'flex',
          gap: '12px',
        }}>
          <button
            onClick={() => handleQualityClick(false)}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: !useProContentModel ? TOSS_COLORS.primary : `${TOSS_COLORS.secondary}15`,
              color: !useProContentModel ? '#FFFFFF' : TOSS_COLORS.secondary,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: !useProContentModel ? 'bold' : 'normal',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ marginBottom: '4px' }}>⚡ 빠른 생성</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>빠르고 경제적이에요</div>
            <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '4px', fontWeight: 'bold' }}>
              {isPremiumUser ? '무료' : '무료 (광고 시청)'}
            </div>
          </button>
          <button
            onClick={() => handleQualityClick(true)}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: useProContentModel ? TOSS_COLORS.primary : `${TOSS_COLORS.secondary}15`,
              color: useProContentModel ? '#FFFFFF' : TOSS_COLORS.secondary,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: useProContentModel ? 'bold' : 'normal',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ marginBottom: '4px' }}>✨ 고품질 생성</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>더 나은 품질이에요</div>
            <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '4px', fontWeight: 'bold' }}>
              {(() => {
                const isFirstFree = isFirstTimeFree('qualityGeneration');
                const creditCost = getCreditCost('qualityGeneration');
                const hasCredit = totalCredits >= creditCost;

                if (isFirstFree) {
                  return '🎁 최초 1회 무료';
                } else if (hasCredit) {
                  return `${creditCost} 크래딧`;
                } else {
                  return `${creditCost} 크래딧 필요`;
                }
              })()}
            </div>
          </button>
        </div>
      </div>

      {/* 템플릿 예시 */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: TOSS_COLORS.text,
          marginBottom: '12px',
        }}>
          📄 템플릿 예시
        </h3>
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
        }}>
          {TEMPLATE_EXAMPLES.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template.example)}
              style={{
                padding: '10px 16px',
                fontSize: '14px',
                color: TOSS_COLORS.primary,
                background: '#FFFFFF',
                border: `1px solid ${TOSS_COLORS.primary}`,
                borderRadius: '8px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {template.title}
            </button>
          ))}
        </div>
      </div>

      {/* 텍스트 입력 */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`프리젠테이션 내용을 입력하세요...\n\n예시:\n우리 회사 소개 프리젠테이션을 만들어주세요.\n\n제목: 혁신적인 핀테크 기업\n\n회사 미션:\n- 금융 서비스의 디지털 혁신\n- 모두를 위한 쉬운 금융\n\n주요 서비스:\n1. 간편 송금 서비스\n2. 자산 관리 플랫폼\n\n감사합니다.`}
        style={{
          width: '100%',
          height: '400px',
          padding: '16px',
          fontSize: '16px',
          color: TOSS_COLORS.text,
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          resize: 'vertical',
          fontFamily: 'inherit',
        }}
      />

      {/* 에러 메시지 */}
      {generationError && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: '#FEE2E2',
          borderRadius: '8px',
          color: TOSS_COLORS.error,
          fontSize: '14px',
        }}>
          {generationError}
          <button
            onClick={clearError}
            style={{
              marginLeft: '10px',
              padding: '4px 8px',
              fontSize: '12px',
              background: 'transparent',
              border: 'none',
              color: TOSS_COLORS.error,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            닫기
          </button>
        </div>
      )}

      {/* 진행 상태 표시 - 화면 정중앙 모달 */}
      {isGenerating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            textAlign: 'center',
          }}>
            {/* 로딩 스피너 */}
            <div style={{
              width: '60px',
              height: '60px',
              margin: '0 auto 24px',
              border: `4px solid ${TOSS_COLORS.primary}20`,
              borderTop: `4px solid ${TOSS_COLORS.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}/>

            {/* 주요 안내 문구 */}
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: TOSS_COLORS.text,
              marginBottom: '12px',
              lineHeight: '1.5',
            }}>
              슬라이드를 작성하고 있어요
            </div>

            <div style={{
              fontSize: '15px',
              color: TOSS_COLORS.textSecondary,
              marginBottom: '8px',
              lineHeight: '1.6',
            }}>
              페이지를 벗어나면 생성이 중단돼요.<br />
              잠시만 기다려 주세요.
            </div>

            {/* 추가 주의사항 (작게) */}
            <div style={{
              fontSize: '12px',
              color: TOSS_COLORS.muted,
              marginBottom: '20px',
              lineHeight: '1.5',
            }}>
              페이지 이탈 시 사용된 크래딧은 환불되지 않아요.
            </div>

            {/* 진행 단계 표시 */}
            <div style={{
              fontSize: '13px',
              color: TOSS_COLORS.textSecondary,
              lineHeight: '1.6',
            }}>
              {researchMode !== 'none' && (
                <div>
                  {generationStep === 'parsing' && '1️⃣ 자료 조사 → 2️⃣ 콘텐츠 생성 → 3️⃣ 구조 파싱 → 4️⃣ 슬라이드 생성'}
                  {generationStep === 'generating' && '✅ 자료 조사 → ✅ 콘텐츠 생성 → ✅ 구조 파싱 → 🔄 슬라이드 생성 중'}
                </div>
              )}
              {researchMode === 'none' && (
                <div>
                  {generationStep === 'parsing' && '1️⃣ 콘텐츠 생성 → 2️⃣ 구조 파싱 → 3️⃣ 슬라이드 생성'}
                  {generationStep === 'generating' && '✅ 콘텐츠 생성 → ✅ 구조 파싱 → 🔄 슬라이드 생성 중'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 애니메이션 키프레임 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }}/>

      {/* 생성 버튼 */}
      <div style={{ marginTop: isGenerating ? '12px' : '20px' }}>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !text.trim()}
          
          size="lg"
          
          variant="default"
          
        >
          {isGenerating ? '생성하고 있어요' : '✨ 슬라이드 생성해요'}
        </Button>
      </div>

      {/* 결제 안내 모달 */}
      {showPaymentModal && (
        <div
          onClick={handleCloseModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            }}
          >
            {/* 모달 헤더 */}
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: TOSS_COLORS.text,
              marginBottom: '12px',
            }}>
              {paymentModalType === 'pro' ? '고품질 생성' : '깊은 조사'} 사용 안내
            </div>

            {/* 모달 내용 */}
            <div style={{
              fontSize: '14px',
              color: TOSS_COLORS.textSecondary,
              marginBottom: '20px',
              lineHeight: '1.6',
            }}>
              {paymentModalType === 'pro'
                ? '고품질 생성을 사용하려면 크래딧이 필요해요. (50 크래딧)'
                : '깊은 조사를 사용하려면 크래딧이 필요해요. (40 크래딧)'}
              <br /><br />
              Pro 구독 시 매월 490 크래딧을 받을 수 있어요.
            </div>

            {/* 가격 정보 */}
            <div style={{
              padding: '12px',
              background: '#F9FAFB',
              borderRadius: '8px',
              marginBottom: '20px',
            }}>
              <div style={{
                fontSize: '13px',
                color: TOSS_COLORS.text,
                marginBottom: '8px',
              }}>
                <strong>옵션 1:</strong> Pro 구독 (₩4,900/월)
                <div style={{ fontSize: '12px', color: TOSS_COLORS.textSecondary, marginTop: '4px' }}>
                  • 광고 제거 + 매월 490 크래딧 제공
                </div>
              </div>
              <div style={{
                fontSize: '13px',
                color: TOSS_COLORS.text,
              }}>
                <strong>옵션 2:</strong> 크레딧 구매
                <div style={{ fontSize: '12px', color: TOSS_COLORS.textSecondary, marginTop: '4px' }}>
                  • 100 크래딧: ₩1,000 / 500 크래딧: ₩5,000
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleGoToSubscription}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  background: TOSS_COLORS.primary,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                구독하기
              </button>
              <button
                onClick={handleGoToCredits}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: TOSS_COLORS.primary,
                  background: '#FFFFFF',
                  border: `1px solid ${TOSS_COLORS.primary}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                크레딧 구매
              </button>
            </div>

            {/* 취소 버튼 */}
            <button
              onClick={handleCloseModal}
              style={{
                width: '100%',
                marginTop: '8px',
                padding: '12px',
                fontSize: '14px',
                color: TOSS_COLORS.textSecondary,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
