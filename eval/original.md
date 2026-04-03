# Representation Theory

## Definitions and Concepts

**Representation theory** is a branch of mathematics studying abstract algebraic structures by representing their elements as linear transformations of vector spaces. The core idea makes abstract algebra concrete by describing elements through matrices and their operations.

The primary algebraic objects amenable to representation include:
- **Groups**: Elements represented by invertible matrices under matrix multiplication
- **Associative algebras**: Sets of all n×n matrices with matrix addition and multiplication
- **Lie algebras**: n×n matrices with the commutator operation MN−NM replacing standard multiplication

### Definition

A representation of a group G (or algebra A) on vector space V is a map Φ: G×V → V satisfying two properties:

1. For any g in G, the map Φ(g): V → V is linear
2. The map preserves group structure: g₁·(g₂·v) = (g₁g₂)·v, with identity element e·v = v

Alternatively, representation is understood as a homomorphism φ: G → GL(V) mapping group elements to invertible linear transformations.

### Terminology

The vector space V is called the representation space. Its dimension (when finite) is the dimension or degree of the representation. When finite-dimensional, choosing a basis allows recovering a matrix representation.

An **effective or faithful representation** has an injective homomorphism φ.

### Equivariant Maps and Isomorphisms

An equivariant map between representations (V,φ) and (W,ψ) of group G is a linear map α: V → W satisfying α(g·v) = g·α(v). These maps preserve the group action structure.

When α is invertible, it constitutes an isomorphism, meaning the representations are equivalent. Representation theory classifies representations "up to isomorphism" since isomorphic representations provide identical information about the group or algebra.

### Subrepresentations, Quotients, and Irreducible Representations

A subrepresentation is a linear subspace W of representation space V that remains invariant under group action (g·w ∈ W for all g ∈ G, w ∈ W).

An **irreducible representation** has only trivial and whole-space subrepresentations. A **reducible representation** contains proper nontrivial subrepresentations.

Schur's lemma states that equivariant maps between irreducible representations are either zero maps or isomorphisms. When the field is algebraically closed, only scalar multiples of identity are equivariant endomorphisms of irreducible representations.

Irreducible representations serve as building blocks—non-irreducible representations decompose into simpler sub- and quotient representations.

### Direct Sums and Indecomposable Representations

The direct sum of representations (V,φ) and (W,ψ) forms a representation via g·(v,w) = (g·v, g·w).

A **decomposable representation** is a direct sum of proper nontrivial subrepresentations. Otherwise it is **indecomposable**.

### Complete Reducibility

In favorable circumstances, finite-dimensional representations decompose as direct sums of irreducibles—such representations are **semisimple**. This occurs for finite groups, compact groups, and semisimple Lie algebras (over characteristic zero fields).

When complete reducibility fails, one must understand extensions building indecomposable representations from irreducibles.

### Tensor Products of Representations

For group representations φ₁: G → GL(V₁) and φ₂: G → GL(V₂), the tensor product representation acts on V₁ ⊗ V₂ via:

(φ₁ ⊗ φ₂)(g) = φ₁(g) ⊗ φ₂(g)

For Lie algebras, the formula adjusts to: (φ₁ ⊗ φ₂)(X) = φ₁(X) ⊗ I + I ⊗ φ₂(X)

Tensor products of irreducibles typically decompose into direct sums of irreducibles—a process known as Clebsch–Gordan theory.

## Branches and Topics

Representation theory varies by:
1. **Algebraic object type** (groups, algebras, Lie algebras)
2. **Vector space nature** (finite vs. infinite-dimensional; Hilbert vs. Banach spaces)
3. **Field type** (complex, real, finite, p-adic; characteristic zero vs. positive)

### Finite Groups

Group representations are essential tools for studying finite groups with applications to geometry and crystallography.

Over characteristic zero fields, finite group representations are semisimple, following from **Maschke's theorem**: any subrepresentation has a G-invariant complement.

**Character theory** provides understanding through characters χ_φ(g) = Tr(φ(g)). Irreducible representations are completely determined by their characters.

Maschke's theorem extends to positive characteristic when the prime p is coprime to |G|. Otherwise, **modular representation theory** studies non-semisimple representations.

Averaging techniques show that real or complex G-representations preserve inner products, making them **unitary**.

Results generalizing finite group theory to broader classes employ **Haar measure** on compact topological groups, yielding **abstract harmonic analysis**.

### Modular Representations

Modular representations study representations over fields whose characteristic divides |G|, where Maschke's theorem fails. **Richard Brauer** extended character theory to this setting, significantly contributing to finite simple group classification.

Modular representations naturally arise in algebraic geometry, coding theory, combinatorics, and number theory.

### Unitary Representations

A unitary representation of group G on a Hilbert space V has φ(g) as unitary operators for all g ∈ G.

**Hermann Weyl** pioneered quantum mechanical applications starting in the 1920s. **Eugene Wigner** analyzed Poincaré group representations. **George Mackey** and **Harish-Chandra** developed general unitary representation theory in subsequent decades.

A major goal is describing the "**unitary dual**"—the space of irreducible unitary representations. For abelian groups, this space consists of characters. For compact groups, the **Peter–Weyl theorem** shows irreducible unitary representations are finite-dimensional with discrete unitary dual.

For non-compact groups, determining which representations are unitary remains subtle and challenging, especially for reductive Lie groups.

### Harmonic Analysis

The circle group S¹ duality with integers ℤ, or torus T^n with ℤ^n, underlies **Fourier series** and **Fourier transforms**. Unitary representation theory and harmonic analysis are intimately connected.

**Abstract harmonic analysis** develops analysis of functions on locally compact topological groups, seeking generalized Fourier transforms and **Plancherel theorems**.

**Pontrjagin duality** and the Peter–Weyl theorem achieve this for abelian and compact groups respectively. For non-abelian, non-compact groups, no general analogue exists, though **Alexander Grothendieck** extended Tannaka–Krein duality linking linear algebraic groups to tannakian categories.

Harmonic analysis extends to homogeneous spaces for G, particularly well-developed for symmetric spaces, providing **automorphic forms** theory.

### Lie Groups

Lie groups are groups that are smooth manifolds. Many classical matrix groups over reals or complex numbers are Lie groups, crucial for physics and chemistry applications.

Representation theory of compact Lie groups, extendable to semisimple Lie groups via **Weyl's unitary trick**, uses complexification and maximal compact subgroups.

General Lie groups decompose as semidirect products of solvable and semisimple parts (**Levi decomposition**). Solvable representation theory is generally intractable, but **Mackey theory** analyzes semidirect products, generalizing **Wigner's classification** of Poincaré group representations.

### Lie Algebras

A Lie algebra over field F is a vector space with a skew-symmetric bilinear Lie bracket satisfying the Jacobi identity. Lie algebras arise as tangent spaces to Lie groups at identity elements, representing "infinitesimal symmetries."

Lie algebras decompose similarly to Lie groups. Finite-dimensional semisimple Lie algebra representations are completely understood via work of **Élie Cartan**, analyzed by choosing a **Cartan subalgebra**—essentially a generic maximal abelian subalgebra.

Representations decompose into weight spaces (eigenspaces of Cartan subalgebra action), reducing analysis to combinatorics of possible weights.

#### Infinite-Dimensional Lie Algebras

**Kac–Moody algebras** (named for **Victor Kac** and **Robert Moody**) generalize finite-dimensional semisimple Lie algebras while sharing combinatorial properties.

**Affine Lie algebras**, special Kac–Moody cases, have importance in mathematics and theoretical physics, especially conformal field theory and exactly solvable models. **Victor Kac** proved combinatorial identities (Macdonald identities) using affine Kac–Moody representation theory.

#### Lie Superalgebras

Lie superalgebras generalize Lie algebras with ℤ₂-graded underlying vector spaces. Skew-symmetry and Jacobi identity properties incorporate sign modifications. Their representation theory parallels Lie algebra representation theory.

### Linear Algebraic Groups

Linear algebraic groups are algebraic geometry analogues of Lie groups over general fields. Over finite fields, they yield **finite groups of Lie type**.

Although classification resembles Lie groups, representation theory differs substantially, requiring different techniques since the Zariski topology is weaker and analytic methods unavailable.

### Invariant Theory

Invariant theory studies actions on algebraic varieties from the perspective of functions forming group representations. Classically, it addressed explicit polynomial functions invariant under linear group transformations.

Modern approaches analyze representation decomposition into irreducibles. Invariant theory of infinite groups connects fundamentally to linear algebra—particularly quadratic forms and determinants.

**David Mumford** revitalized the subject during the 1960s through **geometric invariant theory**. **Felix Klein's** **Erlangen program** and **Élie Cartan's** connections place groups and symmetry centrally in geometry.

Modern developments link representation theory and invariant theory to holonomy, differential operators, and several complex variables theory.

### Automorphic Forms and Number Theory

Automorphic forms generalize modular forms to more general analytic functions, possibly of several complex variables, with similar transformation properties.

This generalizes from modular group PSL₂(ℝ) and congruence subgroups to semisimple Lie group G and discrete subgroup Γ. Automorphic forms relate to harmonic analysis on symmetric spaces.

Special cases worked out before general theory include Hilbert modular forms and Siegel modular forms. Important results include the Selberg trace formula.

### Associative Algebras

Associative algebra representations arise from the structure of n×n matrices under addition and multiplication.

#### Module Theory

Module theory extends representation concepts to associative algebras generally, viewing representations as modules over group algebras.

#### Hopf Algebras and Quantum Groups

Hopf algebras and quantum groups provide frameworks combining algebraic and coalgebraic structures, important for modern representation theory and mathematical physics.

## Generalizations

Success of representation theory has spawned numerous generalizations, most generally to **category theory**.

### Set-Theoretic Representations

Set-theoretic representations extend concepts to actions on sets rather than vector spaces.

### Representations in Other Categories

Target categories can be replaced beyond vector spaces while maintaining foundational structures.

### Representations of Categories

Categories themselves become objects of representation, extending fundamental concepts maximally.

## Asymptotic Representation Theory

Asymptotic representation theory studies large representations and limiting behavior, connecting to probability and combinatorics.

## Applications and Significance

Representation theory is pervasive across mathematics:

- Generalizes Fourier analysis via harmonic analysis
- Connects to geometry through invariant theory and the Erlangen program
- Impacts number theory via automorphic forms and the Langlands program

Representation theory reduces abstract algebra problems to linear algebra—a well-understood subject. Diverse approaches employ algebraic geometry, module theory, analytic number theory, differential geometry, operator theory, algebraic combinatorics, and topology.

In physics, representation theory describes how physical system symmetry groups affect solutions to governing equations, making it fundamental to theoretical frameworks.
