import math
from typing import Tuple, List, Optional

def binomial_coefficient(n: int, k: int) -> int:
    """
    Calculate the binomial coefficient (n choose k) using a more efficient algorithm.
    This is more efficient than computing the individual factorials.
    """
    if k < 0 or k > n:
        return 0
    if k > n - k:  # Take advantage of symmetry
        k = n - k
    c = 1
    for i in range(k):
        c = c * (n - i) // (i + 1)
    return c

def binomial_distribution(p: float, n: int) -> Tuple[List[float], float]:
    """
    Calculate the binomial probability distribution P(X=x) for all x from 0 to n,
    and the expected value (mean) of the distribution.
    
    Args:
        p: Probability of success in a single trial
        n: Number of trials
    
    Returns:
        Tuple containing:
        - List of probabilities for X=0, X=1, ..., X=n
        - Expected value (mean) of the distribution
    """
    if not 0 <= p <= 1 or n < 0:
        raise ValueError("p must be between 0 and 1, and n must be non-negative")
    
    q = 1 - p
    probabilities = []
    mean = 0.0
    
    for x in range(n + 1):
        # Calculate P(X=x) = nCx * p^x * q^(n-x)
        probability = binomial_coefficient(n, x) * (p ** x) * (q ** (n - x))
        probability = round(probability, 4)  # Increased precision
        probabilities.append(probability)
        mean += x * probability
    
    # The theoretical mean of binomial distribution is n*p
    # This is more accurate than summing x*P(X=x)
    theoretical_mean = n * p
    
    return probabilities, round(theoretical_mean, 4)

def display_distribution_table(n: int, probabilities: List[float]) -> None:
    """
    Display the probability distribution in a formatted table.
    """
    print("\nProbability Distribution:")
    print("-" * 50)
    print(f"{'X':<10}{'P(X=x)':<10}")
    print("-" * 50)
    
    for x in range(n + 1):
        print(f"{x:<10}{probabilities[x]:<10}")
    print("-" * 50)

def main() -> None:
    """
    Main function to execute the probability calculator.
    """
    try:
        n = int(input("Enter number of trials (n): "))
        if n < 0:
            raise ValueError("Number of trials must be non-negative")
            
        p = float(input("Enter probability of success (p): "))
        if not 0 <= p <= 1:
            raise ValueError("Probability must be between 0 and 1")
        
        probabilities, mean = binomial_distribution(p, n)
        
        # Display results
        display_distribution_table(n, probabilities)
        
        print(f"\nMean (Expected Value) of X: {mean}")
        print(f"Variance of X: {round(n * p * (1 - p), 4)}")
        
        # Check if the sum of probabilities is close to 1
        total_prob = sum(probabilities)
        if not math.isclose(total_prob, 1.0, abs_tol=1e-10):
            print(f"\nNote: Sum of all probabilities = {total_prob}, which should be 1.0")
        
    except ValueError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    main()