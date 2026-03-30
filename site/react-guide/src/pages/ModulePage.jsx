import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Paper,
  List,
  ThemeIcon,
  Badge,
  Group,
  Box,
  Divider,
  Card,
  Button,
  Anchor,
  Breadcrumbs,
  SimpleGrid,
  Modal,
  Table,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconArrowLeft,
  IconCircleCheck,
  IconExternalLink,
  IconFileText,
  IconServer,
  IconShieldCheck,
  IconScale,
  IconDatabase,
  IconTrophy,
  IconStar,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { modules } from '../data/modules';

// Regulation data for HIPAA and GDPR with detailed content
const regulationData = {
  hipaa: {
    title: 'HIPAA',
    badge: 'USA',
    badgeColor: 'blue',
    color: 'blue',
    shortDesc: 'Health Insurance Portability and Accountability Act',
    overview: 'HIPAA is a US federal law enacted in 1996 that establishes national standards for protecting sensitive patient health information from being disclosed without the patient\'s consent or knowledge. It applies to covered entities (healthcare providers, health plans, healthcare clearinghouses) and their business associates.',
    keyPoints: [
      'Protects all "individually identifiable health information" (PHI)',
      'Requires patient consent before sharing medical information',
      'Establishes security standards for electronic health records',
      'Imposes penalties for violations ranging from $100 to $50,000 per violation',
      'Requires breach notification within 60 days'
    ],

    whyNecessaryForAI: [
      'AI models require large datasets, often containing sensitive patient information that must be protected',
      'Training data can inadvertently memorize and leak personal health information if not properly de-identified',
      'AI systems may have access to more comprehensive patient data than traditional systems, increasing privacy risks',
      'Model outputs could reveal protected health information through inference attacks',
      'Healthcare AI often involves business associates (cloud providers, AI vendors) requiring proper data sharing agreements'
    ],
    caseStudies: [
      {
        id: 1,
        scenario: 'A hospital wants to train an AI model to predict patient readmissions. They have access to full patient records including names, dates of birth, SSNs, and detailed medical histories.',
        question: 'What must the hospital do before using this data for AI training?',
        options: [
          { id: 'a', text: 'Use the data directly since it\'s for improving patient care', isCorrect: false, feedback: 'Incorrect. Even for healthcare improvement, HIPAA requires proper authorization or de-identification.' },
          { id: 'b', text: 'Remove the 18 HIPAA identifiers (Safe Harbor method) or obtain patient authorization', isCorrect: true, feedback: 'Correct! HIPAA requires either de-identification using Safe Harbor (removing 18 identifiers) or obtaining proper patient authorization.' },
          { id: 'c', text: 'Only remove patient names and SSNs', isCorrect: false, feedback: 'Incorrect. HIPAA\'s Safe Harbor method requires removing all 18 identifiers, not just names and SSNs.' },
          { id: 'd', text: 'Encrypt the data and proceed', isCorrect: false, feedback: 'Incorrect. Encryption alone doesn\'t satisfy HIPAA requirements for secondary use without authorization.' }
        ],
        context: 'Privacy Rule',
        learningPoint: 'The Privacy Rule requires either de-identification (18 identifiers removed) or explicit authorization before using PHI for purposes beyond treatment, payment, and operations.'
      },
      {
        id: 2,
        scenario: 'An AI startup signs a contract with a hospital to build a diagnostic tool. They will access patient imaging data and radiology reports stored in the hospital\'s cloud infrastructure.',
        question: 'What security measures must be in place?',
        options: [
          { id: 'a', text: 'Just password protection on accounts', isCorrect: false, feedback: 'Incorrect. HIPAA Security Rule requires comprehensive technical, physical, and administrative safeguards.' },
          { id: 'b', text: 'Encryption at rest and in transit, access controls with audit logs, and a Business Associate Agreement', isCorrect: true, feedback: 'Correct! The Security Rule requires encryption, access controls, audit logging, plus a BAA since the startup is a business associate.' },
          { id: 'c', text: 'Only encrypt data when sending between systems', isCorrect: false, feedback: 'Incorrect. Data must be encrypted both at rest (stored) and in transit, plus other safeguards are required.' },
          { id: 'd', text: 'No special measures needed since it\'s for medical purposes', isCorrect: false, feedback: 'Incorrect. HIPAA Security Rule applies regardless of the medical purpose.' }
        ],
        context: 'Security Rule',
        learningPoint: 'Business associates (like AI vendors) must sign BAAs and implement administrative, physical, and technical safeguards including encryption, access controls, and audit trails.'
      },
      {
        id: 3,
        scenario: 'During model training, an engineer accidentally uploads a dataset containing 5,000 patient records with PHI to a public GitHub repository. The data was exposed for 6 hours before being removed.',
        question: 'What are the hospital\'s HIPAA obligations?',
        options: [
          { id: 'a', text: 'Nothing required since data was quickly removed', isCorrect: false, feedback: 'Incorrect. Any unauthorized disclosure of PHI requires breach assessment and potentially notification.' },
          { id: 'b', text: 'Only notify patients if someone accessed the data', isCorrect: false, feedback: 'Incorrect. Potential access to unsecured PHI requires notification even if actual access is unknown.' },
          { id: 'c', text: 'Conduct risk assessment and notify affected patients within 60 days; notify HHS since it affects 500+ individuals', isCorrect: true, feedback: 'Correct! Breaches affecting 500+ individuals must be reported to HHS within 60 days and to all affected individuals without unreasonable delay.' },
          { id: 'd', text: 'Wait 90 days to investigate before notifying anyone', isCorrect: false, feedback: 'Incorrect. Notification must occur within 60 days of breach discovery, not 90 days.' }
        ],
        context: 'Breach Notification Rule',
        learningPoint: 'Breaches affecting 500+ individuals require notification to HHS within 60 days, to affected individuals without unreasonable delay (typically within 60 days), and may require media notification.'
      }
    ],
    coreRules: [
      {
        title: 'Safe Harbor De-identification: 18 Identifiers to Remove',
        description: 'To de-identify data under HIPAA Safe Harbor method, remove or generalize these identifiers:',
        items: [
          '1. Names (individual, relatives, employers)',
          '2. Geographic subdivisions smaller than state (except first 3 digits of ZIP if area has 20,000+ people)',
          '3. Dates directly related to individual (birth, admission, discharge, death) - keep year only',
          '4. Phone numbers',
          '5. Fax numbers',
          '6. Email addresses',
          '7. Social Security numbers',
          '8. Medical record numbers',
          '9. Health plan beneficiary numbers',
          '10. Account numbers',
          '11. Certificate/license numbers',
          '12. Vehicle identifiers (license plates, serial numbers)',
          '13. Device identifiers and serial numbers',
          '14. URLs',
          '15. IP addresses',
          '16. Biometric identifiers (fingerprints, voiceprints)',
          '17. Full-face photos and comparable images',
          '18. Any other unique identifying number, characteristic, or code'
        ]
      },
      {
        title: 'Security Rule: Required Safeguards',
        description: 'HIPAA requires three categories of safeguards for ePHI:',
        items: [
          'Administrative Safeguards: Risk analysis, workforce training, contingency planning, Business Associate Agreements',
          'Physical Safeguards: Facility access controls, workstation security, device and media controls',
          'Technical Safeguards: Access controls (unique user IDs, encryption), audit controls, integrity controls, transmission security'
        ]
      },
      {
        title: 'Breach Notification Requirements',
        description: 'When protected health information is breached:',
        items: [
          'Individual Notification: Notify affected individuals within 60 days of discovery',
          'HHS Notification: Report to HHS within 60 days if 500+ individuals affected; annually for smaller breaches',
          'Media Notification: Prominent media outlets if breach affects 500+ individuals in a state/jurisdiction',
          'Business Associate Notification: BA must notify covered entity within 60 days of discovering breach',
          'Content Requirements: Description of breach, types of data involved, steps individuals should take, what entity is doing'
        ]
      }
    ],
    videoUrl: 'https://www.youtube.com/watch?v=rqV28R3UKDM',
    videoTitle: 'HIPAA Explained: Privacy and Security Rules',
    learnMoreUrl: 'https://www.hhs.gov/hipaa/index.html'
  },
  gdpr: {
    title: 'GDPR',
    badge: 'EU',
    badgeColor: 'grape',
    color: 'grape',
    shortDesc: 'General Data Protection Regulation',
    overview: 'GDPR is a comprehensive data protection law enacted by the European Union in 2018. It applies to any organization that processes personal data of EU residents, regardless of where the organization is located. GDPR gives individuals strong rights over their personal data and imposes strict obligations on data processors.',
    keyPoints: [
      'Applies to any EU citizen data, even if processed outside the EU',
      'Requires explicit consent for data processing',
      'Grants individuals the "right to be forgotten" (data erasure)',
      'Mandates data breach notification within 72 hours',
      'Violations can result in fines up to €20 million or 4% of global revenue',
      'Requires Data Protection Impact Assessments (DPIA) for high-risk processing'
    ],

    whyNecessaryForAI: [
      'AI training data aggregation can create privacy risks even from seemingly anonymized datasets',
      'Automated decision-making impacts individuals\' rights, requiring transparency and human oversight',
      'AI models can process data for purposes beyond original collection, requiring new legal basis',
      'Cross-border data transfers for AI training require additional safeguards under GDPR',
      'The "right to explanation" means individuals can demand to know how AI made decisions about them'
    ],
    caseStudies: [
      {
        id: 1,
        scenario: 'A fitness app company wants to train an AI model using health data from 50,000 European users. They originally collected the data for "improving user experience" and now want to use it for a new AI-powered health recommendation feature.',
        question: 'Can they legally use this data for the new AI feature under GDPR?',
        options: [
          { id: 'a', text: 'Yes, since users agreed to the privacy policy', isCorrect: false, feedback: 'Incorrect. GDPR requires explicit consent for each specific purpose. Original consent for "improving experience" doesn\'t cover AI training.' },
          { id: 'b', text: 'No, they need new explicit consent explaining the AI use case', isCorrect: true, feedback: 'Correct! GDPR\'s purpose limitation principle requires new consent when data is used for purposes incompatible with the original collection purpose.' },
          { id: 'c', text: 'Yes, as long as they anonymize the data first', isCorrect: false, feedback: 'Incorrect. While anonymization helps, they still need proper legal basis for the new processing purpose.' },
          { id: 'd', text: 'Yes, it falls under legitimate interest', isCorrect: false, feedback: 'Incorrect. For sensitive health data, explicit consent is typically required, and legitimate interest is rarely sufficient.' }
        ],
        context: 'Lawful Basis & Purpose Limitation',
        learningPoint: 'GDPR requires organizations to obtain new consent when using data for purposes incompatible with the original collection, especially for sensitive categories like health data.'
      },
      {
        id: 2,
        scenario: 'A European patient discovers that a hospital\'s AI system made an error in prioritizing their treatment based on automated risk scoring. They want to challenge the decision and understand how the AI reached its conclusion.',
        question: 'What rights does the patient have under GDPR?',
        options: [
          { id: 'a', text: 'No rights since the AI is a medical tool', isCorrect: false, feedback: 'Incorrect. GDPR specifically protects individuals from solely automated decision-making in significant matters.' },
          { id: 'b', text: 'Right to explanation of the AI logic and right to human review of the decision', isCorrect: true, feedback: 'Correct! GDPR grants the right to meaningful information about automated decision-making logic and the right to human intervention and review.' },
          { id: 'c', text: 'Only the right to delete their data from future processing', isCorrect: false, feedback: 'Incorrect. Rights extend beyond deletion to include explanation and human review of automated decisions affecting them.' },
          { id: 'd', text: 'No specific rights unless they can prove harm', isCorrect: false, feedback: 'Incorrect. GDPR grants rights proactively, not contingent on proving harm.' }
        ],
        context: 'Individual Rights & Automated Decision-Making',
        learningPoint: 'GDPR Article 22 gives individuals the right not to be subject to solely automated decision-making in significant matters, plus rights to explanation and human review.'
      },
      {
        id: 3,
        scenario: 'A research team in Germany wants to build an AI model to predict disease progression using hospital records. They plan to aggregate data from multiple hospitals, train the model, and share findings with pharmaceutical companies.',
        question: 'What GDPR requirement must they complete before starting?',
        options: [
          { id: 'a', text: 'Just obtain ethics committee approval', isCorrect: false, feedback: 'Incorrect. While ethics approval is important, GDPR specifically requires a DPIA for high-risk health data processing.' },
          { id: 'b', text: 'Data Protection Impact Assessment (DPIA) documenting risks and safeguards', isCorrect: true, feedback: 'Correct! GDPR Article 35 mandates a DPIA for high-risk processing, especially involving health data, systematic monitoring, or large-scale processing.' },
          { id: 'c', text: 'Only anonymize data before use', isCorrect: false, feedback: 'Incorrect. Even with anonymization, GDPR requires a DPIA for high-risk processing at the planning stage.' },
          { id: 'd', text: 'Notify the data protection authority after training starts', isCorrect: false, feedback: 'Incorrect. DPIA must be completed BEFORE processing begins, and authority notification is only required if risks cannot be adequately mitigated.' }
        ],
        context: 'Data Protection Impact Assessment',
        learningPoint: 'GDPR requires a DPIA before processing that is likely to result in high risk to individuals, documenting data flows, risks, necessity, and mitigation measures.'
      },
      {
        id: 4,
        scenario: 'An AI company trains a medical diagnosis model using EU patient data. A patient requests deletion of their data under the "right to be forgotten." However, removing individual records from a trained neural network is technically complex.',
        question: 'How should the company respond under GDPR?',
        options: [
          { id: 'a', text: 'Refuse since the model is already trained', isCorrect: false, feedback: 'Incorrect. GDPR\'s right to erasure applies even to trained models. Technical difficulty doesn\'t eliminate the obligation.' },
          { id: 'b', text: 'Delete from training set and consider retraining model or using machine unlearning techniques', isCorrect: true, feedback: 'Correct! Organizations must delete data from training sets and, where feasible, retrain models or implement machine unlearning to fulfill erasure rights.' },
          { id: 'c', text: 'Only delete their data from future model versions', isCorrect: false, feedback: 'Incorrect. The right to erasure requires addressing current processing, not just future uses.' },
          { id: 'd', text: 'Provide a copy of their data but keep it in the model', isCorrect: false, feedback: 'Incorrect. This describes the right to data portability, not erasure. The right to be forgotten requires actual deletion.' }
        ],
        context: 'Right to Erasure & AI Models',
        learningPoint: 'The right to erasure ("right to be forgotten") requires organizations to delete personal data and take reasonable steps to remove it from trained AI models, potentially requiring retraining or machine unlearning.'
      }
    ],    coreRules: [
      {
        title: 'Six Lawful Bases for Processing',
        description: 'Data processing must have one of these legal bases:',
        items: [
          'Consent: Freely given, specific, informed agreement (required for health data)',
          'Contract: Processing necessary to fulfill a contract',
          'Legal obligation: Required by law',
          'Vital interests: Necessary to protect someone\'s life',
          'Public task: Performing official functions',
          'Legitimate interests: Necessary for legitimate purposes (rare for health data)'
        ]
      },
      {
        title: 'Core Principles',
        description: 'All AI data processing must follow these principles:',
        items: [
          'Lawfulness, fairness, transparency: Legal basis + clear communication',
          'Purpose limitation: Only use data for stated purposes',
          'Data minimization: Collect only what\'s necessary',
          'Accuracy: Keep data up-to-date and correct',
          'Storage limitation: Don\'t keep data longer than needed',
          'Integrity & confidentiality: Secure against unauthorized access',
          'Accountability: Document compliance and demonstrate it'
        ]
      },
      {
        title: 'Individual Rights',
        description: 'People have these rights over their data:',
        items: [
          'Right to be informed: Clear privacy notices',
          'Right of access: Get copies of their data',
          'Right to rectification: Correct inaccurate data',
          'Right to erasure: "Right to be forgotten" (with exceptions)',
          'Right to restrict processing: Limit how data is used',
          'Right to data portability: Receive data in machine-readable format',
          'Right to object: Object to processing (especially automated decisions)',
          'Rights re automated decision-making: Human review of significant automated decisions'
        ]
      },
      {
        title: 'When DPIA Is Required',
        description: 'You must conduct a Data Protection Impact Assessment for:',
        items: [
          'Systematic and extensive profiling with significant effects',
          'Large-scale processing of special category data (health, genetic, biometric)',
          'Systematic monitoring of publicly accessible areas at large scale',
          'Use of new technologies',
          'Processing that prevents people from exercising rights or using services'
        ]
      }
    ],    videoUrl: 'https://www.youtube.com/watch?v=Bfd9XYGN5qs',
    videoTitle: 'GDPR Explained: What You Need to Know',
    learnMoreUrl: 'https://gdpr.eu/'
  }
};

// Regulation Card Component with Modal
function RegulationCard({ regulationKey }) {
  const [opened, { open, close }] = useDisclosure(false);
  const regulation = regulationData[regulationKey];
  const [currentCase, setCurrentCase] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [completedCases, setCompletedCases] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!opened) {
      // Reset on close
      setCurrentCase(0);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setCompletedCases([]);
      setScore(0);
    }
  }, [opened]);

  const handleAnswerSelect = (optionId) => {
    if (!showFeedback) {
      setSelectedAnswer(optionId);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer) {
      const caseStudy = regulation.caseStudies[currentCase];
      const selectedOption = caseStudy.options.find(opt => opt.id === selectedAnswer);
      
      setShowFeedback(true);
      
      let newScore = score;
      if (selectedOption.isCorrect) {
        newScore = score + 1;
        setScore(newScore);
      }
      
      const newCompletedCases = [...completedCases, {
        caseId: caseStudy.id,
        correct: selectedOption.isCorrect
      }];
      setCompletedCases(newCompletedCases);

      // Save progress to localStorage when quiz is completed
      if (currentCase === regulation.caseStudies.length - 1) {
        const quizKey = `${regulationKey}-quiz`;
        const progressData = JSON.parse(localStorage.getItem('learningProgress') || '{}');
        progressData[quizKey] = {
          score: newScore,
          totalQuestions: regulation.caseStudies.length,
          completed: true,
          completedAt: new Date().toISOString(),
        };
        localStorage.setItem('learningProgress', JSON.stringify(progressData));
      }
    }
  };

  const handleNext = () => {
    if (currentCase < regulation.caseStudies.length - 1) {
      setCurrentCase(currentCase + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const isLastCase = currentCase === regulation.caseStudies.length - 1;
  const percentage = completedCases.length > 0 ? Math.round((score / completedCases.length) * 100) : 0;
  const getBadge = () => {
    if (completedCases.length === 0) return null;
    if (percentage === 100) return { label: 'Expert', color: 'yellow' };
    if (percentage >= 75) return { label: 'Proficient', color: 'green' };
    if (percentage >= 50) return { label: 'Learning', color: 'blue' };
    return { label: 'Needs Practice', color: 'orange' };
  };
  const badge = getBadge();

  return (
    <>
      <Modal opened={opened} onClose={close} title={regulation.title} size="1200px" centered>
        <Box>
          <Group mb="md" justify="space-between">
            <Group>
              <Badge color={regulation.badgeColor} variant="filled" size="lg">{regulation.badge}</Badge>
              <Box>
                <Text fw={700} size="xl">{regulation.title}</Text>
                <Text size="sm" c="dimmed">{regulation.shortDesc}</Text>
              </Box>
            </Group>
            {completedCases.length > 0 && badge && (
              <Group gap="xs">
                <Paper p="xs" radius="md" withBorder>
                  <Group gap="xs">
                    <IconTrophy size={20} color={badge.color} />
                    <Box>
                      <Text size="xs" c="dimmed" lh={1}>Score</Text>
                      <Text fw={700} size="lg" lh={1}>{score}/{regulation.caseStudies.length}</Text>
                    </Box>
                  </Group>
                </Paper>
                <Badge size="lg" color={badge.color} variant="filled" leftSection={<IconStar size={14} />}>
                  {badge.label}
                </Badge>
              </Group>
            )}
          </Group>

          <Divider my="md" />

          <Text fw={600} size="lg" mb="xs">Overview</Text>
          <Text size="md" mb="lg">{regulation.overview}</Text>

          <Text fw={600} size="lg" mb="xs">Key Requirements</Text>
          <List size="sm" mb="lg" spacing="xs">
            {regulation.keyPoints.map((point, idx) => (
              <List.Item key={idx}>{point}</List.Item>
            ))}
          </List>

          <Paper p="md" mb="lg" radius="md" withBorder bg="yellow.0">
            <Text fw={600} size="lg" mb="xs">Why This Is Necessary for AI Data</Text>
            <List size="sm" spacing="xs">
              {regulation.whyNecessaryForAI.map((reason, idx) => (
                <List.Item key={idx}>{reason}</List.Item>
              ))}
            </List>
          </Paper>

          {regulation.coreRules && (
            <Paper p="lg" mb="lg" radius="md" withBorder bg="grape.0">
              <Group mb="md">
                <ThemeIcon size={40} radius="xl" color="grape">
                  <IconCircleCheck size={20} />
                </ThemeIcon>
                <Box>
                  <Text fw={600} size="lg">Essential Rules & Requirements</Text>
                  <Text size="xs" c="dimmed">Learn these fundamentals before testing your knowledge</Text>
                </Box>
              </Group>
              
              <SimpleGrid cols={2} spacing="md">
                {regulation.coreRules.map((rule, idx) => (
                  <Paper key={idx} p="md" radius="md" bg="white" withBorder>
                    <Text fw={600} size="md" mb="xs">{rule.title}</Text>
                    <Text size="sm" c="dimmed" mb="xs">{rule.description}</Text>
                    <List size="sm" spacing="xs">
                      {rule.items.map((item, itemIdx) => (
                        <List.Item key={itemIdx}>{item}</List.Item>
                      ))}
                    </List>
                  </Paper>
                ))}
              </SimpleGrid>
            </Paper>
          )}

          <Paper p="lg" mb="lg" radius="md" withBorder bg="blue.0">
            <Group mb="md" justify="space-between">
              <Group>
                <ThemeIcon size={40} radius="xl" color={regulation.color}>
                  <IconCircleCheck size={20} />
                </ThemeIcon>
                <Box>
                  <Text fw={600} size="lg">Interactive Case Studies</Text>
                  <Text size="xs" c="dimmed">Test your understanding with real-world scenarios</Text>
                </Box>
              </Group>
              <Badge size="lg" variant="light">
                Case {currentCase + 1} of {regulation.caseStudies.length}
              </Badge>
            </Group>

            {(() => {
              const caseStudy = regulation.caseStudies[currentCase];
              return (
                <Box>
                  <Paper p="md" mb="md" radius="md" withBorder bg="white">
                    <Badge color={regulation.color} mb="xs">{caseStudy.context}</Badge>
                    <Text fw={600} size="md" mb="sm">Scenario:</Text>
                    <Text size="sm" mb="md">{caseStudy.scenario}</Text>
                    <Text fw={600} size="md" mb="sm" c={regulation.color}>{caseStudy.question}</Text>
                  </Paper>

                  <Box mb="md">
                    {caseStudy.options.map((option) => {
                      const isSelected = selectedAnswer === option.id;
                      const showCorrect = showFeedback && option.isCorrect;
                      const showIncorrect = showFeedback && isSelected && !option.isCorrect;
                      
                      return (
                        <Paper
                          key={option.id}
                          p="md"
                          mb="sm"
                          radius="md"
                          withBorder
                          onClick={() => handleAnswerSelect(option.id)}
                          bg={showCorrect ? 'teal.0' : showIncorrect ? 'red.0' : isSelected ? 'gray.1' : 'white'}
                          style={{
                            cursor: showFeedback ? 'default' : 'pointer',
                            borderColor: showCorrect ? 'var(--mantine-color-teal-6)' : showIncorrect ? 'var(--mantine-color-red-6)' : isSelected ? 'var(--mantine-color-gray-6)' : undefined,
                            borderWidth: showCorrect || showIncorrect ? 2 : 1
                          }}
                        >
                          <Group justify="space-between">
                            <Group>
                              <Badge variant="outline" size="lg">{option.id.toUpperCase()}</Badge>
                              <Text size="sm">{option.text}</Text>
                            </Group>
                            {showCorrect && <IconCheck size={20} color="var(--mantine-color-teal-6)" />}
                            {showIncorrect && <IconX size={20} color="var(--mantine-color-red-6)" />}
                          </Group>
                          {showFeedback && isSelected && (
                            <Paper p="sm" mt="sm" bg={option.isCorrect ? 'teal.1' : 'red.1'} radius="sm">
                              <Text size="sm" c={option.isCorrect ? 'teal.9' : 'red.9'}>{option.feedback}</Text>
                            </Paper>
                          )}
                        </Paper>
                      );
                    })}
                  </Box>

                  {!showFeedback ? (
                    <Button 
                      fullWidth 
                      color={regulation.color} 
                      onClick={handleSubmit}
                      disabled={!selectedAnswer}
                      size="lg"
                    >
                      Submit Answer
                    </Button>
                  ) : (
                    <Box>
                      <Paper p="md" mb="md" radius="md" bg="yellow.0" withBorder>
                        <Text fw={600} mb="xs">💡 Key Learning Point:</Text>
                        <Text size="sm">{caseStudy.learningPoint}</Text>
                      </Paper>
                      {!isLastCase ? (
                        <Button fullWidth color={regulation.color} onClick={handleNext} size="lg">
                          Next Case →
                        </Button>
                      ) : (
                        <Paper p="lg" radius="md" bg="green.0" withBorder ta="center">
                          <ThemeIcon size={60} radius="xl" color="green" mx="auto" mb="md">
                            <IconTrophy size={30} />
                          </ThemeIcon>
                          <Text fw={700} size="xl" mb="xs">Challenge Complete!</Text>
                          <Text size="lg" mb="md">Final Score: {score}/{regulation.caseStudies.length} ({percentage}%)</Text>
                          <Text size="sm" c="dimmed">You've completed all {regulation.title} case studies</Text>
                        </Paper>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })()}
          </Paper>

          <Divider my="md" />

          <Paper p="md" bg="blue.0" radius="md" withBorder>
            <Text fw={600} mb="sm">Learn More</Text>
            <Text size="sm" mb="md">Watch this video for a comprehensive overview:</Text>
            <Anchor href={regulation.videoUrl} target="_blank" size="sm" mb="sm" display="block">
              📺 {regulation.videoTitle} <IconExternalLink size={14} style={{ marginLeft: 4 }} />
            </Anchor>
            <Anchor href={regulation.learnMoreUrl} target="_blank" size="sm" display="block">
              📄 Official {regulation.title} Documentation <IconExternalLink size={14} style={{ marginLeft: 4 }} />
            </Anchor>
          </Paper>
        </Box>
      </Modal>

      <Card 
        shadow="xs" 
        padding="md" 
        radius="md" 
        withBorder 
        onClick={open}
        style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--mantine-shadow-xs)';
        }}
      >
        <Badge color={regulation.badgeColor} variant="filled" mb="sm">{regulation.badge}</Badge>
        <Title order={5} mb="xs">{regulation.title}</Title>
        <Text size="sm" c="dimmed" mb="md">
          {regulation.shortDesc}
        </Text>
        <Text size="xs" c={regulation.color} fw={600}>Click to learn more →</Text>
      </Card>
    </>
  );
}

// Ethical Pillars data with definitions and violation examples
const ethicalPillarsData = {
  fairness: {
    title: 'Fairness',
    icon: IconScale,
    color: 'green',
    shortDesc: 'Equal treatment across demographics',
    definition: 'Fairness in AI means ensuring that algorithmic systems do not discriminate against individuals or groups based on protected characteristics such as race, gender, age, or socioeconomic status. It requires that AI models perform equally well across different demographic groups and that outcomes are equitable.',
    violationTitle: 'Optum Algorithm Racial Bias (2019)',
    violationDesc: 'A widely-used healthcare algorithm developed by Optum was found to systematically discriminate against Black patients. The algorithm used healthcare costs as a proxy for health needs, but because Black patients historically had less access to healthcare, they incurred lower costs. As a result, Black patients had to be significantly sicker than white patients to receive the same level of care recommendations. The bias affected an estimated 200 million patients annually.',
    citation: 'Obermeyer, Z., Powers, B., Vogeli, C., & Mullainathan, S. (2019). Dissecting racial bias in an algorithm used to manage the health of populations. Science, 366(6464), 447-453.',
    citationUrl: 'https://www.science.org/doi/10.1126/science.aax2342',
  },
  transparency: {
    title: 'Transparency',
    icon: IconFileText,
    color: 'blue',
    shortDesc: 'Explainable decisions and processes',
    definition: 'Transparency in AI requires that the decision-making processes of algorithmic systems be understandable and explainable to stakeholders. This includes clear documentation of how models work, what data they use, their limitations, and how decisions are made. Patients and healthcare providers should be able to understand why an AI system made a particular recommendation.',
    violationTitle: 'IBM Watson for Oncology (2018)',
    violationDesc: 'IBM\'s Watson for Oncology was marketed globally as an AI system to recommend cancer treatments. However, investigations revealed that the system\'s recommendations were based on a small number of synthetic cases rather than real patient data, and doctors had no visibility into how recommendations were generated. In some cases, Watson suggested treatments that were unsafe or inappropriate. The lack of transparency about how the system worked led to patient safety concerns.',
    citation: 'Ross, C., & Swetlitz, I. (2018). IBM\'s Watson supercomputer recommended "unsafe and incorrect" cancer treatments, internal documents show. STAT News.',
    citationUrl: 'https://www.statnews.com/2018/07/25/ibm-watson-recommended-unsafe-incorrect-treatments/',
  },
  accountability: {
    title: 'Accountability',
    icon: IconShieldCheck,
    color: 'grape',
    shortDesc: 'Clear ownership and oversight',
    definition: 'Accountability in AI means establishing clear lines of responsibility for AI system outcomes. Organizations must be able to identify who is responsible when AI systems cause harm, implement governance structures for AI oversight, and have mechanisms for redress when things go wrong. This includes audit trails, human oversight requirements, and clear policies for when AI recommendations should be overridden.',
    violationTitle: 'Horizon Health Faulty Sepsis Algorithm (2021)',
    violationDesc: 'Epic Systems\' sepsis prediction algorithm, deployed across hundreds of hospitals, was found to miss most sepsis cases while generating many false alarms. Despite evidence of poor performance, hospitals continued using it because no clear accountability existed for monitoring AI performance. The lack of oversight meant the algorithm operated for years without proper validation, potentially contributing to preventable patient deaths.',
    citation: 'Wong, A., et al. (2021). External Validation of a Widely Implemented Proprietary Sepsis Prediction Model in Hospitalized Patients. JAMA Internal Medicine, 181(8), 1065-1070.',
    citationUrl: 'https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2781307',
  },
  safety: {
    title: 'Safety',
    icon: IconCircleCheck,
    color: 'teal',
    shortDesc: 'Robust testing and monitoring',
    definition: 'Safety in AI requires rigorous testing, validation, and continuous monitoring to ensure that AI systems do not cause harm. This includes pre-deployment testing across diverse populations, ongoing performance monitoring, mechanisms to detect and respond to failures, and fail-safe designs that default to human judgment in uncertain situations.',
    violationTitle: 'Babylon Health Chatbot Misdiagnosis (2020)',
    violationDesc: 'Babylon Health\'s AI-powered symptom checker app was found to provide potentially dangerous medical advice. In tests, the chatbot failed to identify serious conditions including heart attacks and meningitis, instead suggesting less urgent care. The company had marketed the app as being as accurate as doctors, but independent testing revealed significant safety gaps. The app was being used by millions of NHS patients in the UK.',
    citation: 'Fraser, H., Coiera, E., & Wong, D. (2018). Safety of patient-facing digital symptom checkers. The Lancet, 392(10161), 2263-2264.',
    citationUrl: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(18)32819-8/fulltext',
  },
};

// Ethical Pillar Card Component with Modal
function EthicalPillarCard({ pillarKey }) {
  const [opened, { open, close }] = useDisclosure(false);
  const pillar = ethicalPillarsData[pillarKey];
  const Icon = pillar.icon;

  return (
    <>
      <Modal opened={opened} onClose={close} title={pillar.title} size="lg" centered>
        <Box>
          <Group mb="md">
            <ThemeIcon color={pillar.color} size={50} radius="xl">
              <Icon size={26} />
            </ThemeIcon>
            <Box>
              <Text fw={700} size="xl">{pillar.title}</Text>
              <Badge color={pillar.color} variant="light">{pillar.shortDesc}</Badge>
            </Box>
          </Group>

          <Divider my="md" />

          <Text fw={600} size="lg" mb="xs">Definition</Text>
          <Text size="sm" mb="lg" c="dimmed">{pillar.definition}</Text>

          <Paper p="md" bg="red.0" radius="md" withBorder style={{ borderColor: 'var(--mantine-color-red-3)' }}>
            <Badge color="red" variant="filled" mb="sm">Real-World Violation</Badge>
            <Text fw={600} size="md" mb="xs">{pillar.violationTitle}</Text>
            <Text size="sm" mb="md">{pillar.violationDesc}</Text>
            <Text size="xs" c="dimmed" fs="italic" mb="xs">
              <Text span fw={600}>Citation: </Text>
              {pillar.citation}
            </Text>
            <Anchor href={pillar.citationUrl} target="_blank" size="xs">
              View Source <IconExternalLink size={12} style={{ marginLeft: 4 }} />
            </Anchor>
          </Paper>
        </Box>
      </Modal>

      <Card 
        shadow="xs" 
        padding="md" 
        radius="md" 
        withBorder 
        onClick={open}
        style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--mantine-shadow-xs)';
        }}
      >
        <ThemeIcon color={pillar.color} size={40} radius="xl" mb="sm">
          <Icon size={20} />
        </ThemeIcon>
        <Text fw={600}>{pillar.title}</Text>
        <Text size="sm" c="dimmed">{pillar.shortDesc}</Text>
        <Text size="xs" c={pillar.color} mt="xs">Click to learn more →</Text>
      </Card>
    </>
  );
}

// Ethical Pillars Grid Component
function EthicalPillarsGrid() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
      <EthicalPillarCard pillarKey="fairness" />
      <EthicalPillarCard pillarKey="transparency" />
      <EthicalPillarCard pillarKey="accountability" />
      <EthicalPillarCard pillarKey="safety" />
    </SimpleGrid>
  );
}

const moduleIcons = {
  'module-1': IconFileText,
  'module-2': IconShieldCheck,
  'module-3': IconScale,
  'module-4': IconServer,
  'module-5': IconDatabase,
};

// Module content components
const moduleContent = {
  'module-1': {
    title: 'Data Specifications',
    subtitle: 'Define fields, schemas, and quality rules so prompts, RAG docs, and fine-tune sets stay consistent.',
    sections: [
      {
        title: 'Overview',
        content: (
          <>
            <Text size="md" mb="md">
              Good data specifications are the foundation of any successful AI project. This module covers
              how to define clear data requirements, create schemas, and establish quality rules.
            </Text>
            <Text size="md" mb="md">
              <Text span fw={600}>Why it matters:</Text> Whether you&apos;re writing prompts, building RAG systems,
              or fine-tuning models, consistent data specifications ensure reproducible results.
            </Text>
          </>
        ),
      },
      {
        title: 'What You\'ll Learn',
        content: (
          <List size="md" spacing="sm" icon={<ThemeIcon color="green" size={24} radius="xl"><IconCircleCheck size={16} /></ThemeIcon>}>
            <List.Item>How to create data dictionaries for healthcare datasets</List.Item>
            <List.Item>JSON Schema design for patient and clinical data</List.Item>
            <List.Item>Data quality rules and validation strategies</List.Item>
            <List.Item>Mapping real-world requirements to structured formats</List.Item>
          </List>
        ),
      },
      {
        title: 'Key Resources',
        content: (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Text fw={600} mb="xs">Data Dictionary Template</Text>
              <Text size="sm" c="dimmed" mb="sm">
                A reusable template for documenting fields, types, and constraints.
              </Text>
              <Badge color="green" variant="light">Template</Badge>
            </Card>
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Text fw={600} mb="xs">Patient Health Schema</Text>
              <Text size="sm" c="dimmed" mb="sm">
                JSON Schema example for patient health records.
              </Text>
              <Badge color="blue" variant="light">Example</Badge>
            </Card>
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Text fw={600} mb="xs">Dental Record Schema</Text>
              <Text size="sm" c="dimmed" mb="sm">
                JSON Schema for dental visit documentation.
              </Text>
              <Badge color="blue" variant="light">Example</Badge>
            </Card>
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Text fw={600} mb="xs">Data Requirements Template</Text>
              <Text size="sm" c="dimmed" mb="sm">
                Checklist for gathering data requirements from stakeholders.
              </Text>
              <Badge color="green" variant="light">Template</Badge>
            </Card>
          </SimpleGrid>
        ),
      },
    ],
  },
  'module-2': {
    title: 'Regulations & Compliance',
    subtitle: 'HIPAA/GDPR basics, de-identification, and safe handling of synthetic healthcare data.',
    sections: [
      {
        title: 'Overview',
        content: (
          <>
            <Text size="md" mb="md">
              Healthcare data is among the most regulated in the world. This module covers the essential
              compliance requirements you need to understand when working with AI in healthcare contexts.
            </Text>
            <Text size="md" mb="md" c="red.7" fw={600}>
              ⚠ Important: Always use synthetic or properly de-identified data for AI experimentation.
              Never use real patient data without proper authorization and safeguards.
            </Text>
          </>
        ),
      },
      {
        title: 'Key Regulations',
        content: (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <RegulationCard regulationKey="hipaa" />
            <RegulationCard regulationKey="gdpr" />
          </SimpleGrid>
        ),
      },
      {
        title: 'What You\'ll Learn',
        content: (
          <List size="md" spacing="sm" icon={<ThemeIcon color="green" size={24} radius="xl"><IconCircleCheck size={16} /></ThemeIcon>}>
            <List.Item>HIPAA Safe Harbor de-identification method (18 identifiers)</List.Item>
            <List.Item>Expert Determination method for statistical de-identification</List.Item>
            <List.Item>Data handling policies for AI projects</List.Item>
            <List.Item>Compliance checklists for healthcare AI development</List.Item>
          </List>
        ),
      },
    ],
  },
  'module-3': {
    title: 'Ethical AI',
    subtitle: 'Fairness, transparency, and accountability practices for healthcare AI systems.',
    sections: [
      {
        title: 'Overview',
        content: (
          <>
            <Text size="md" mb="md">
              AI systems in healthcare can have life-or-death implications. This module covers the ethical
              frameworks and practices needed to build responsible AI systems.
            </Text>
            <Text size="md" mb="md">
              <Text span fw={600}>Core principle:</Text> AI should augment human decision-making, not replace it,
              especially in high-stakes healthcare contexts.
            </Text>
          </>
        ),
      },
      {
        title: 'Ethical Pillars',
        content: <EthicalPillarsGrid />,
      },
      {
        title: 'What You\'ll Learn',
        content: (
          <List size="md" spacing="sm" icon={<ThemeIcon color="green" size={24} radius="xl"><IconCircleCheck size={16} /></ThemeIcon>}>
            <List.Item>Bias detection and mitigation strategies</List.Item>
            <List.Item>Ethical AI frameworks (IEEE, EU AI Act principles)</List.Item>
            <List.Item>Documenting AI system decisions and limitations</List.Item>
            <List.Item>Human-in-the-loop design patterns</List.Item>
          </List>
        ),
      },
    ],
  },
  'module-4': {
    title: 'AI Environment Setup',
    subtitle: 'Set up your AI learning environment using AWS Bedrock (school login) or run models locally on your Mac.',
    sections: [
      {
        title: 'Choose Your Path',
        content: (
          <>
            <Text size="md" mb="md">
              You have two options for running AI models in this course. Choose based on your preferences
              and hardware capabilities.
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="md">
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Badge color="blue" variant="filled" mb="sm">Cloud Option</Badge>
                <Title order={4} mb="sm">AWS Bedrock</Title>
                <Text size="sm" c="dimmed" mb="md">
                  Use your UO credentials to access powerful cloud-hosted models like Claude 3.
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item><Text span c="green">✓</Text> No local setup required</List.Item>
                  <List.Item><Text span c="green">✓</Text> Access to latest models</List.Item>
                  <List.Item><Text span c="green">✓</Text> UO SSO authentication</List.Item>
                  <List.Item><Text span c="orange">⚠</Text> Requires internet connection</List.Item>
                </List>
              </Card>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Badge color="green" variant="filled" mb="sm">Local Option</Badge>
                <Title order={4} mb="sm">Ollama (Mac)</Title>
                <Text size="sm" c="dimmed" mb="md">
                  Run open-source models directly on your MacBook for complete privacy.
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item><Text span c="green">✓</Text> 100% private—data stays local</List.Item>
                  <List.Item><Text span c="green">✓</Text> No API costs</List.Item>
                  <List.Item><Text span c="green">✓</Text> Works offline</List.Item>
                  <List.Item><Text span c="orange">⚠</Text> Requires 8GB+ RAM</List.Item>
                </List>
              </Card>
            </SimpleGrid>
          </>
        ),
      },
      {
        title: 'Quick Start',
        content: (
          <>
            <Title order={5} mb="sm" c="blue">AWS Bedrock (5 minutes)</Title>
            <List size="sm" mb="lg" type="ordered">
              <List.Item>Go to AWS Bedrock Console</List.Item>
              <List.Item>Sign in with UO credentials</List.Item>
              <List.Item>Navigate to Playgrounds → Chat</List.Item>
              <List.Item>Select Claude 3 Haiku and start prompting</List.Item>
            </List>

            <Title order={5} mb="sm" c="green">Ollama Local (10 minutes)</Title>
            <Paper p="md" bg="gray.0" radius="md" mb="md">
              <Text size="sm" ff="monospace" mb="xs"># Install Ollama</Text>
              <Text size="sm" ff="monospace" mb="md">brew install ollama</Text>
              <Text size="sm" ff="monospace" mb="xs"># Download a model</Text>
              <Text size="sm" ff="monospace" mb="md">ollama pull phi3:mini</Text>
              <Text size="sm" ff="monospace" mb="xs"># Start chatting</Text>
              <Text size="sm" ff="monospace">ollama run phi3:mini</Text>
            </Paper>
          </>
        ),
      },
      {
        title: 'Model Recommendations by RAM',
        content: (
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Badge color="blue" variant="light" mb="sm">8GB RAM</Badge>
              <Text fw={600}>Phi-3 Mini</Text>
              <Text size="sm" c="dimmed">3.8B parameters, fast inference</Text>
            </Card>
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Badge color="green" variant="light" mb="sm">16GB RAM</Badge>
              <Text fw={600}>Mistral 7B</Text>
              <Text size="sm" c="dimmed">Great balance of speed & quality</Text>
            </Card>
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Badge color="grape" variant="light" mb="sm">32GB+ RAM</Badge>
              <Text fw={600}>Llama 3 8B</Text>
              <Text size="sm" c="dimmed">Full precision, best quality</Text>
            </Card>
          </SimpleGrid>
        ),
      },
    ],
  },
  'module-5': {
    title: 'Synthetic Data',
    subtitle: 'Generate and validate synthetic health and dental datasets for privacy-preserving experimentation.',
    sections: [
      {
        title: 'Overview',
        content: (
          <>
            <Text size="md" mb="md">
              Synthetic data allows you to experiment with realistic healthcare data without privacy concerns.
              This module covers how to generate, validate, and use synthetic datasets effectively.
            </Text>
            <Text size="md" mb="md">
              <Text span fw={600} c="green">Key benefit:</Text> Train and test AI models without ever touching
              real patient data, eliminating compliance risks while maintaining statistical validity.
            </Text>
          </>
        ),
      },
      {
        title: 'Available Datasets',
        content: (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Badge color="teal" variant="filled" mb="sm">Healthcare</Badge>
              <Title order={5} mb="xs">Synthetic Patients</Title>
              <Text size="sm" c="dimmed" mb="md">
                1,000+ synthetic patient records with demographics, diagnoses, and medications.
              </Text>
              <Group gap="xs">
                <Badge size="sm" variant="outline">CSV</Badge>
                <Badge size="sm" variant="outline">JSON</Badge>
              </Group>
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Badge color="cyan" variant="filled" mb="sm">Dental</Badge>
              <Title order={5} mb="xs">Dental Visits</Title>
              <Text size="sm" c="dimmed" mb="md">
                Synthetic dental visit records with procedures, findings, and treatment plans.
              </Text>
              <Group gap="xs">
                <Badge size="sm" variant="outline">CSV</Badge>
                <Badge size="sm" variant="outline">JSON</Badge>
              </Group>
            </Card>
          </SimpleGrid>
        ),
      },
      {
        title: 'What You\'ll Learn',
        content: (
          <List size="md" spacing="sm" icon={<ThemeIcon color="green" size={24} radius="xl"><IconCircleCheck size={16} /></ThemeIcon>}>
            <List.Item>Using Python generators to create synthetic healthcare data</List.Item>
            <List.Item>Validating synthetic data for statistical realism</List.Item>
            <List.Item>Customizing generators for specific use cases</List.Item>
            <List.Item>Best practices for synthetic data in AI training</List.Item>
          </List>
        ),
      },
    ],
  },
};

export default function ModulePage() {
  const { moduleId } = useParams();
  const module = modules.find((m) => m.id === moduleId);
  const content = moduleContent[moduleId];
  const Icon = moduleIcons[moduleId];

  if (!module || !content) {
    return (
      <Container size="lg" py="xl">
        <Title order={2}>Module Not Found</Title>
        <Text c="dimmed" mb="md">The requested module does not exist.</Text>
        <Button component={Link} to="/" leftSection={<IconArrowLeft size={16} />}>
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Breadcrumbs mb="lg">
        <Anchor component={Link} to="/" size="sm">Home</Anchor>
        <Text size="sm">{content.title}</Text>
      </Breadcrumbs>

      <Paper shadow="md" radius="lg" p="xl" mb="xl" className="hero">
        <Group gap="md" mb="md">
          <ThemeIcon color="green" size={56} radius="xl">
            <Icon size={28} />
          </ThemeIcon>
          <Box>
            <Badge color="green" variant="filled" size="lg" mb="xs">
              {module.id.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </Badge>
            <Title order={1}>{content.title}</Title>
          </Box>
        </Group>
        <Text size="lg" c="dimmed">{content.subtitle}</Text>
      </Paper>

      {content.sections.map((section, index) => (
        <Box key={index} mb="xl">
          <Title order={3} mb="md" className="section-title">
            {section.title}
          </Title>
          {section.content}
          {index < content.sections.length - 1 && <Divider mt="xl" />}
        </Box>
      ))}

      <Divider my="xl" />

      <Group justify="space-between">
        <Button
          component={Link}
          to="/"
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
        >
          Back to Home
        </Button>
        {module.children && module.children.length > 0 && (
          <Group gap="xs">
            <Text size="sm" c="dimmed">Resources:</Text>
            {module.children.map((child) => (
              <Button
                key={child.label}
                component="a"
                href={child.href}
                target="_blank"
                variant="light"
                size="xs"
                rightSection={<IconExternalLink size={14} />}
              >
                {child.label}
              </Button>
            ))}
          </Group>
        )}
      </Group>
    </Container>
  );
}
