import { BoundBinaryExpression } from "./CodeAnalysis/Binding/BoundBinaryExpression";
import { BoundCellReference } from "./CodeAnalysis/Binding/BoundCellReference";
import { BoundIdentifier } from "./CodeAnalysis/Binding/BoundIdentifier";
import { BoundKind } from "./CodeAnalysis/Binding/BoundKind";
import { BoundNode } from "./CodeAnalysis/Binding/BoundNode";
import { BoundNumber } from "./CodeAnalysis/Binding/BoundNumber";
import { BoundBinaryOperatorKind } from "./CodeAnalysis/Binding/BoundBinaryOperatorKind";
import { BoundRangeReference } from "./CodeAnalysis/Binding/BoundRangeReference";
import { BoundReferenceAssignment } from "./CodeAnalysis/Binding/BoundReferenceAssignment";
import { BoundSyntaxTree } from "./CodeAnalysis/Binding/BoundSyntaxTree";
import { BoundUnaryExpression } from "./CodeAnalysis/Binding/BoundUnaryExpression";
import { Diagnostics } from "./CodeAnalysis/Diagnostics/Diagnostics";
import { BoundUnaryOperatorKind } from "./CodeAnalysis/Binding/BoundUnaryOperatorKind";

export class Evaluator {
  constructor(public Logger: Diagnostics) {}

  private Nodes = new Map<string, BoundReferenceAssignment>();
  private Values = new Map<string, number>();
  private Stats = new Map<string, number>();
  private Changes = new Set<string>();

  ReportStats() {
    console.log(this.Stats);
  }

  Evaluate<Kind extends BoundNode>(Bound: Kind) {
    type BoundType<T> = Kind & T;

    switch (Bound.Kind) {
      case BoundKind.BoundSyntaxTree:
        return this.EvaluateSyntaxTree(Bound as BoundType<BoundSyntaxTree>);
      case BoundKind.BoundIdentifier:
        return this.EvaluateIdentifier(Bound as BoundType<BoundIdentifier>);
      case BoundKind.BoundNumber:
        return this.EvaluateNumber(Bound as BoundType<BoundNumber>);
      case BoundKind.BoundCellReference:
        return this.EvaluateCellReference(Bound as BoundType<BoundCellReference>);
      case BoundKind.BoundRangeReference:
        return this.EvaluateRangeReference(Bound as BoundType<BoundRangeReference>);
      case BoundKind.BoundUnaryExpression:
        return this.EvaluateUnaryExpression(Bound as BoundType<BoundUnaryExpression>);
      case BoundKind.BoundBinaryExpression:
        return this.EvaluateBinaryExpression(Bound as BoundType<BoundBinaryExpression>);
      case BoundKind.BoundReferenceAssignment:
        return this.EvaluateReferenceAssignment(Bound as BoundType<BoundReferenceAssignment>);
      default:
        this.Logger.MissingEvaluationMethod(Bound.Kind);
    }
  }

  // A1->3; A2->A1+7; A3->A1+A2+5;
  private EvaluateReferenceAssignment(Bound: BoundReferenceAssignment) {
    const Reference = Bound.Reference;

    if (this.Stats.has(Reference)) {
      this.Stats.set(Reference, this.Stats.get(Reference) + 1);
    } else {
      this.Stats.set(Reference, 1);
    }

    // Prepare BoundNode
    this.PrepareBoundReferenceForEvaluation(Bound);

    // And Then Evaluate
    const Value = this.Evaluate(Bound.Expression);
    this.Values.set(Reference, Value);

    // Track Recursively All The References That Will Be Affected So To Execute Re Evaluating Expressions Only Once
    this.TrackChanges(Bound);
    this.Changes.forEach((Ref) => {
      this.Values.set(Ref, this.Evaluate(this.Nodes.get(Ref).Expression));
    });
    this.Changes.clear();

    // Store Reference Node
    this.Nodes.set(Reference, Bound);
    return Value;
  }

  // Track And Store All The Effected References Due To Node Change
  private TrackChanges(Node: BoundReferenceAssignment) {
    Node.ReferencedBy.forEach((Ref) => {
      this.Changes.add(Ref);
      this.TrackChanges(this.Nodes.get(Ref));
    });
  }

  private PrepareBoundReferenceForEvaluation(Bound: BoundReferenceAssignment) {
    const Reference = Bound.Reference;

    // Register Node To Its Dependencies
    Bound.Referencing.forEach((Ref) => {
      const Node = this.Nodes.get(Ref);
      if (Node.ReferencedBy.includes(Reference)) return; // Prevent Storing Multiple References
      Node.ReferencedBy.push(Reference);
    });

    // If There Is No Existing Reference Stop
    if (!this.Nodes.has(Reference)) return;

    // Else ...
    const PrevNode = this.Nodes.get(Reference);
    // If Other Nodes Are Referencing This Node Then Copy Reference Values
    Bound.ReferencedBy = PrevNode.ReferencedBy;
    // Clear This Reference From Previous Dependencies
    PrevNode.Referencing.forEach((Ref) => {
      if (Bound.Referencing.includes(Ref)) return;
      const DependencyNode = this.Nodes.get(Ref);
      DependencyNode.ReferencedBy = DependencyNode.ReferencedBy.filter((Each) => Each !== Reference);
    });
  }

  private EvaluateBinaryExpression(Bound: BoundBinaryExpression) {
    const LeftValue = this.Evaluate(Bound.Left);
    const RightValue = this.Evaluate(Bound.Right);
    switch (Bound.OperatorKind) {
      case BoundBinaryOperatorKind.Addition:
        return LeftValue + RightValue;
      case BoundBinaryOperatorKind.Subtraction:
        return LeftValue - RightValue;
      case BoundBinaryOperatorKind.Multiplication:
        return LeftValue * RightValue;
      case BoundBinaryOperatorKind.Division:
        return LeftValue / RightValue;
      default:
        this.Logger.NotAnOperator(Bound.OperatorKind);
    }
  }

  private EvaluateUnaryExpression(Bound: BoundUnaryExpression) {
    const Value = this.Evaluate(Bound.Expression);
    switch (Bound.OperatorKind) {
      case BoundUnaryOperatorKind.Identity:
        return Value;
      case BoundUnaryOperatorKind.Negation:
        return -Value;
      default:
        this.Logger.NotAnOperator(Bound.OperatorKind);
    }
  }

  private EvaluateRangeReference(Bound: BoundRangeReference) {
    this.Logger.MissingEvaluationMethod(Bound.Kind);
  }

  private EvaluateCellReference(Bound: BoundCellReference) {
    if (this.Values.has(Bound.Reference)) return this.Values.get(Bound.Reference);
    this.Logger.ValueDoesNotExist(Bound.Reference);
  }

  private EvaluateNumber(Bound: BoundNumber) {
    return Bound.Value;
  }

  private EvaluateIdentifier(Bound: BoundIdentifier) {
    this.Logger.MissingEvaluationMethod(Bound.Kind);
  }

  private EvaluateSyntaxTree(Bound: BoundSyntaxTree) {
    let Value: number = 0;
    if (Bound.Expressions.length) {
      Bound.Expressions.forEach((BoundExpression) => (Value = this.Evaluate(BoundExpression) as number));
      return Value;
    }
    this.Logger.EmptySyntaxForEvaluator();
  }
}
