
document.addEventListener('DOMContentLoaded', function () {
    // Get elements
    const examPatternSelect = document.getElementById('examPattern');
    const customSettings = document.getElementById('customSettings');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultsDiv = document.getElementById('results');

    // Set up event listeners
    examPatternSelect.addEventListener('change', function () {
        if (this.value === 'custom') {
            customSettings.style.display = 'block';
        } else {
            customSettings.style.display = 'none';
        }
    });

    calculateBtn.addEventListener('click', calculateScore);

    function calculateScore() {
        // Get input values
        const pattern = examPatternSelect.value;

        let totalQuestions, mcqQuestions, numericalQuestions, mcqOptions, marksPerCorrect, negativeMarks;

        if (pattern === '2023') {
            // JEE Mains 2023-25 pattern
            totalQuestions = 90;
            mcqQuestions = 75;
            numericalQuestions = 15;
            mcqOptions = 4;
            marksPerCorrect = 4;
            negativeMarks = 1;
        } else {
            // Custom pattern
            totalQuestions = parseInt(document.getElementById('totalQuestions').value);
            mcqQuestions = parseInt(document.getElementById('mcqQuestions').value);
            numericalQuestions = parseInt(document.getElementById('numericalQuestions').value);
            mcqOptions = parseInt(document.getElementById('mcqOptions').value);
            marksPerCorrect = parseInt(document.getElementById('marksPerCorrect').value);
            negativeMarks = parseInt(document.getElementById('negativeMarks').value);

            // Validate inputs
            if (mcqQuestions + numericalQuestions !== totalQuestions) {
                alert("The sum of MCQ and Numerical questions must equal the total questions.");
                return;
            }
        }

        const simulations = parseInt(document.getElementById('simulations').value);

        // Calculate theoretical values
        const mcqProbCorrect = 1 / mcqOptions;
        const mcqProbWrong = 1 - mcqProbCorrect;
        const numericalProbCorrect = 0; // Effectively 0 for random guessing

        // Expected value for one MCQ question
        const mcqExpectedValue = (mcqProbCorrect * marksPerCorrect) - (mcqProbWrong * negativeMarks);

        // Expected value for one numerical question (assume zero for random guessing)
        const numericalExpectedValue = 0;

        // Overall theoretical expected value
        const theoreticalExpectedValue = (mcqQuestions * mcqExpectedValue) + (numericalQuestions * numericalExpectedValue);

        // Theoretical variance for MCQ questions
        const mcqVariance = mcqProbCorrect * Math.pow(marksPerCorrect - mcqExpectedValue, 2) +
            mcqProbWrong * Math.pow(-negativeMarks - mcqExpectedValue, 2);

        // Theoretical standard deviation
        const theoreticalStdDev = Math.sqrt(mcqQuestions * mcqVariance);

        // Run simulations
        const scores = runSimulations(mcqQuestions, numericalQuestions, mcqOptions, marksPerCorrect, negativeMarks, simulations);

        // Calculate statistics from simulations
        const simulationMean = mean(scores);
        const simulationStdDev = standardDeviation(scores, simulationMean);
        const positiveScoreCount = scores.filter(score => score > 0).length;
        const positiveScoreProb = positiveScoreCount / simulations;

        // Calculate 95% confidence interval
        const lowerBound = Math.floor(simulationMean - 1.96 * simulationStdDev);
        const upperBound = Math.ceil(simulationMean + 1.96 * simulationStdDev);

        // Update UI
        document.getElementById('expectedScore').textContent = simulationMean.toFixed(2);
        document.getElementById('stdDev').textContent = simulationStdDev.toFixed(2);
        document.getElementById('scoreRange').textContent = `${lowerBound} to ${upperBound}`;
        document.getElementById('positiveProb').textContent = (positiveScoreProb * 100).toFixed(1) + '%';

        // Update theoretical explanation
        document.getElementById('theoreticalExplanation').innerHTML = `
                    <p>For each MCQ question:</p>
                    <ul>
                        <li>Probability of guessing correctly: 1/${mcqOptions} = ${mcqProbCorrect.toFixed(4)}</li>
                        <li>Expected value per MCQ: (${mcqProbCorrect.toFixed(4)} × ${marksPerCorrect}) - (${mcqProbWrong.toFixed(4)} × ${negativeMarks}) = ${mcqExpectedValue.toFixed(4)} marks</li>
                    </ul>
                    <p>For ${mcqQuestions} MCQs, the expected contribution is ${mcqQuestions} × ${mcqExpectedValue.toFixed(4)} = ${(mcqQuestions * mcqExpectedValue).toFixed(2)} marks.</p>
                    <p>For numerical answer type questions, random guessing will yield approximately 0 marks.</p>
                    <p>Total theoretical expected score: ${theoreticalExpectedValue.toFixed(2)} marks</p>
                    <p>Theoretical standard deviation: ${theoreticalStdDev.toFixed(2)}</p>
                `;

        // Create distribution chart
        createDistributionChart(scores);

        // Show results
        resultsDiv.style.display = 'block';
    }

    function runSimulations(mcqQuestions, numericalQuestions, mcqOptions, marksPerCorrect, negativeMarks, simulations) {
        const scores = [];

        for (let i = 0; i < simulations; i++) {
            let score = 0;

            // Simulate MCQ questions
            for (let q = 0; q < mcqQuestions; q++) {
                const randomGuess = Math.floor(Math.random() * mcqOptions);
                const correctAnswer = 0; // Assuming the first option is always correct for simplicity

                if (randomGuess === correctAnswer) {
                    // Correct answer
                    score += marksPerCorrect;
                } else {
                    // Wrong answer
                    score -= negativeMarks;
                }
            }

            // Numerical questions are virtually impossible to guess randomly
            // We could simulate them, but the probability is effectively 0

            scores.push(score);
        }

        return scores;
    }

    function mean(array) {
        const sum = array.reduce((a, b) => a + b, 0);
        return sum / array.length;
    }

    function standardDeviation(array, meanValue) {
        if (meanValue === undefined) {
            meanValue = mean(array);
        }

        const squareDiffs = array.map(value => {
            const diff = value - meanValue;
            return diff * diff;
        });

        const avgSquareDiff = mean(squareDiffs);
        return Math.sqrt(avgSquareDiff);
    }

    function createDistributionChart(scores) {
        // Create a frequency distribution
        const minScore = Math.min(...scores);
        const maxScore = Math.max(...scores);

        // Create bins for the histogram
        const binSize = Math.max(1, Math.ceil((maxScore - minScore) / 30)); // Adjust bin size for better visibility
        const bins = {};

        for (let i = Math.floor(minScore / binSize) * binSize; i <= Math.ceil(maxScore / binSize) * binSize; i += binSize) {
            bins[i] = 0;
        }

        // Count scores in each bin
        scores.forEach(score => {
            const binKey = Math.floor(score / binSize) * binSize;
            bins[binKey] = (bins[binKey] || 0) + 1;
        });

        // Convert to arrays for plotting
        const binKeys = Object.keys(bins).map(Number);
        const binValues = binKeys.map(key => bins[key] || 0);
        const normalizedBinValues = binValues.map(value => value / scores.length); // Convert to probability

        // Create the chart
        const data = [{
            x: binKeys.map(key => key + binSize / 2), // Center the bars on the bin
            y: normalizedBinValues,
            type: 'bar',
            marker: {
                color: 'rgb(52, 152, 219)',
                opacity: 0.8
            },
            name: 'Probability'
        }];

        const layout = {
            title: 'Score Distribution (Random Guessing)',
            xaxis: {
                title: 'Score',
                tickformat: 'd'
            },
            yaxis: {
                title: 'Probability',
                tickformat: '.2%'
            },
            bargap: 0.1
        };

        Plotly.newPlot('distributionChart', data, layout);
    }
});
