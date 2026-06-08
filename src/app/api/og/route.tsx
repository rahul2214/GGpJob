import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const scoreParam = searchParams.get('score')
    const score = scoreParam ? parseInt(scoreParam, 10) : 75

    // Dynamic rating labels
    let ratingLabel = "Needs Improvement"
    let ratingColor = "#f43f5e" // Rose
    if (score >= 80) {
      ratingLabel = "Excellent Match"
      ratingColor = "#10b981" // Emerald
    } else if (score >= 60) {
      ratingLabel = "Good Potential"
      ratingColor = "#f59e0b" // Amber
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0b0f19',
            backgroundImage: 'linear-gradient(to bottom right, #0b0f19, #111827, #1e1b4b)',
            fontFamily: 'sans-serif',
            padding: '60px 80px',
            boxSizing: 'border-box',
            border: '8px solid #2e5bff',
          }}
        >
          {/* Top Logo and Header */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '40px',
            }}
          >
            <span
              style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#ffffff',
                letterSpacing: '-0.05em',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              Jobs<span style={{ color: '#2e5bff' }}>Dart</span>
            </span>
            <span
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              AI ATS RESUME CHECKER
            </span>
          </div>

          {/* Main Visual Content */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'space-between',
              flex: 1,
            }}
          >
            {/* Left Column: Big Score display */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '320px',
                height: '320px',
                borderRadius: '160px',
                border: `12px solid ${ratingColor}`,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                boxShadow: '0 0 40px rgba(46, 91, 255, 0.15)',
              }}
            >
              <span
                style={{
                  fontSize: '96px',
                  fontWeight: 'black',
                  color: '#ffffff',
                  lineHeight: 1,
                }}
              >
                {score}
              </span>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginTop: '8px',
                }}
              >
                Score / 100
              </span>
            </div>

            {/* Right Column: Statement, dynamic tag, and CTA */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                flex: 1,
                paddingLeft: '60px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  padding: '8px 20px',
                  borderRadius: '30px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: `1px solid rgba(255, 255, 255, 0.1)`,
                  marginBottom: '24px',
                }}
              >
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: ratingColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {ratingLabel}
                </span>
              </div>

              <span
                style={{
                  fontSize: '44px',
                  fontWeight: 'extrabold',
                  color: '#ffffff',
                  lineHeight: '1.2',
                  marginBottom: '20px',
                  letterSpacing: '-0.02em',
                }}
              >
                My resume scored {score}/100 on JobsDart!
              </span>

              <p
                style={{
                  fontSize: '20px',
                  color: '#94a3b8',
                  lineHeight: '1.5',
                  margin: 0,
                  marginBottom: '36px',
                }}
              >
                Implementing suggested improvements raised key ATS safety, keyword compatibility, and impact score.
              </p>

              {/* Bottom CTA bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    backgroundColor: '#2e5bff',
                    padding: '12px 28px',
                    borderRadius: '12px',
                    marginRight: '20px',
                  }}
                >
                  Check Your Resume Free
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    color: '#64748b',
                    fontWeight: 500,
                  }}
                >
                  jobsdart.in/ats-score
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.error("OG generation error:", e)
    return new Response(`Failed to generate image`, { status: 500 })
  }
}
