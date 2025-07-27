/** @jest-environment jsdom */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PracticeSection } from "./PracticeSection";
import {
  useDrillDownMistake,
  useEvaluateDrillDownAnswer,
  useCreateSrsFromPracticeMistake,
  useStudyDeck,
} from "@/lib/hooks/data";

// Mock hooks
jest.mock("@/lib/hooks/data", () => ({
  useDrillDownMistake: jest.fn(),
  useEvaluateDrillDownAnswer: jest.fn(),
  useCreateSrsFromPracticeMistake: jest.fn(),
  useStudyDeck: jest.fn(),
}));
jest.mock("@/lib/stores/language.store", () => ({
  useLanguageStore: () => ({ activeTargetLanguage: "spanish" }),
}));

const mockedUseDrillDownMistake = useDrillDownMistake as jest.Mock;
const mockedUseEvaluateDrillDownAnswer = useEvaluateDrillDownAnswer as jest.Mock;
const mockedUseStudyDeck = useStudyDeck as jest.Mock;

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("PracticeSection", () => {
  const mockMutateDrillDown = jest.fn();
  const mockMutateEvaluate = jest.fn().mockResolvedValue({});

  const defaultProps = {
    originalText: "I goed to the store.",
    correctedText: "I went to the store.",
    explanation: "The past tense of 'go' is 'went'.",
    mistakeId: "mistake-123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseDrillDownMistake.mockReturnValue({
      mutate: mockMutateDrillDown,
      isPending: false,
      isSuccess: false,
      data: null,
      isError: false,
    });
    mockedUseEvaluateDrillDownAnswer.mockReturnValue({
      mutateAsync: mockMutateEvaluate,
      isPending: false,
    });
    mockedUseStudyDeck.mockReturnValue({ data: [] });
    (useCreateSrsFromPracticeMistake as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
      isSuccess: false,
    });
  });

  it("calls the drill down mutation on initial render", () => {
    render(<PracticeSection {...defaultProps} />, { wrapper });

    expect(mockMutateDrillDown).toHaveBeenCalledTimes(1);
    expect(mockMutateDrillDown).toHaveBeenCalledWith({
      mistakeId: defaultProps.mistakeId,
      originalText: defaultProps.originalText,
      correctedText: defaultProps.correctedText,
      explanation: defaultProps.explanation,
      targetLanguage: "spanish",
      existingTasks: [],
    });
  });

  it("displays a loading spinner while initially generating exercises", () => {
    // Set mock to return pending state
    mockedUseDrillDownMistake.mockReturnValue({
      mutate: mockMutateDrillDown,
      isPending: true,
      isSuccess: false,
      data: null,
      isError: false,
    });

    render(<PracticeSection {...defaultProps} />, { wrapper });

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("displays practice sentences on successful drill down", async () => {
    const practiceSentences = [
      { task: "Translate: 'He goes'", answer: "Él va" },
      { task: "Fill in the blank: She ____.", answer: "goes" },
    ];
    // Start with a pending state to simulate loading
    mockedUseDrillDownMistake.mockReturnValue({
      mutate: mockMutateDrillDown,
      isPending: true,
      isSuccess: false,
      data: null,
      isError: false,
    });
    const { rerender } = render(<PracticeSection {...defaultProps} />, {
      wrapper,
    });

    // Now, update the mock to reflect a successful fetch
    mockedUseDrillDownMistake.mockReturnValue({
      mutate: mockMutateDrillDown,
      isPending: false,
      isSuccess: true,
      data: { practiceSentences },
      isError: false,
    });

    // Rerender the component with the new props from the hook
    rerender(<PracticeSection {...defaultProps} />);

    expect(await screen.findByText("Translate: 'He goes'")).toBeInTheDocument();
    expect(
      screen.getByText("Fill in the blank: She ____."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Check Answers/i }),
    ).toBeInTheDocument();
  });

  it("calls the evaluate mutation when 'Check Answers' is clicked", async () => {
    const practiceSentences = [
      { task: "Translate: 'A'", answer: "Alpha" },
      { task: "Translate: 'B'", answer: "Beta" },
    ];
    // Start with a pending state to simulate loading
    mockedUseDrillDownMistake.mockReturnValue({
      mutate: mockMutateDrillDown,
      isPending: true,
      isSuccess: false,
      data: null,
      isError: false,
    });
    const { rerender } = render(<PracticeSection {...defaultProps} />, {
      wrapper,
    });

    // Update the mock to reflect a successful fetch
    mockedUseDrillDownMistake.mockReturnValue({
      mutate: mockMutateDrillDown,
      isPending: false,
      isSuccess: true,
      data: { practiceSentences },
      isError: false,
    });
    rerender(<PracticeSection {...defaultProps} />);

    const textareas = await screen.findAllByPlaceholderText(
      "Type your answer here...",
    );
    fireEvent.change(textareas[0], { target: { value: "User Answer A" } });

    const checkButton = screen.getByRole("button", { name: /Check Answers/i });
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(mockMutateEvaluate).toHaveBeenCalledTimes(1);
    });

    expect(mockMutateEvaluate).toHaveBeenCalledWith({
      mistakeId: defaultProps.mistakeId,
      taskPrompt: "Translate: 'A'",
      expectedAnswer: "Alpha",
      userAnswer: "User Answer A",
      targetLanguage: "spanish",
    });
  });
});